'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Permission } from '@/lib/types/auth';
import { userService } from '@/lib/services/userService';
import { AuthApi } from '@/lib/services/authApi';

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  anonymousLogin: () => boolean;
  logout: () => void;
  canAccess: (section: string, action: string) => boolean;
  getUserPermissions: () => Permission[];
  isAdmin: () => boolean;
  refreshUser: () => void;
  updateAvatar: (avatar: string) => Promise<void>;
  uploadAvatarFile: (file: File) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Проверяем, что мы на клиенте
    if (typeof window === 'undefined') return;
    
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
    }
  }, []);

  const anonymousLogin = () => {
    // Проверяем, что мы на клиенте
    if (typeof window === 'undefined') return false;
    
    const anonymousUser: User = {
      id: 'anonymous',
      email: 'anonymous@yu.edu.kz',
      name: 'Аноним',
      position: 'Гость',
      role: 'anonymous',
      permissions: [
        { section: 'news', actions: ['read'] },
        { section: 'events', actions: ['read'] },
        { section: 'calendar', actions: ['read'] },
        { section: 'education', actions: ['read'] },
        { section: 'science', actions: ['read'] },
        { section: 'upbringing', actions: ['read'] },
        { section: 'eservices', actions: ['read'] }
      ],
      avatar: '/avatar.jpg'
    };

    setUser(anonymousUser);
    localStorage.setItem('user', JSON.stringify(anonymousUser));
    
    // Also update individual localStorage items for AvatarContext
    localStorage.setItem('user.name', anonymousUser.name);
    if (anonymousUser.position) {
      localStorage.setItem('user.position', anonymousUser.position);
    }
    
    return true;
  };

  const login = async (email: string, password: string) => {
    // Проверяем, что мы на клиенте
    if (typeof window === 'undefined') return;
    
    try {
      // Вызываем внешний API авторизации через прокси
      const resp = await AuthApi.login(email, password);
      
      // Try to fetch user profile for richer info
      let profile: any = null;
      try {
        profile = await AuthApi.profile();
        console.log('Profile data from API:', profile);
      } catch (e) {
        console.warn('Profile load failed:', e);
      }
  
      // Роль и разрешения приходят из API
      const role = profile?.role || resp.role || 'student';
      const permissions = profile?.permissions || resp.permissions || [];
      
      console.log('Роль из API:', role);
      console.log('Разрешения из API:', permissions);
  
      // Use data from login response first, then profile response - только из API
      const firstName = resp.first_name || profile?.first_name;
      const lastName = resp.last_name || profile?.last_name;
      const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName;
      const username = resp.username || profile?.username;
      const avatar = resp.avatar || profile?.avatar;
      const position = resp.position || profile?.position;
      
      console.log('Данные из API:', { 
        firstName, lastName, fullName, username, avatar, position, role
      });

      const newUser: User = {
        id: String(resp.id ?? profile?.id ?? 'unknown'),
        email: email,
        name: fullName || email,
        position: position,
        role,
        permissions: permissions,
        avatar: avatar || '/avatar.jpg'
      };
  
      console.log('Созданный пользователь:', newUser);
  
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      if (resp.access_token) {
        localStorage.setItem('auth.token', String(resp.access_token));
      }
      // Save username separately if present
      if (username) {
        localStorage.setItem('user.username', String(username));
      }
      
      // Also update individual localStorage items for AvatarContext
      localStorage.setItem('user.name', newUser.name);
      if (newUser.position) {
        localStorage.setItem('user.position', newUser.position);
      }
      if (newUser.avatar) {
        localStorage.setItem('user.avatar', newUser.avatar);
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    // Проверяем, что мы на клиенте
    if (typeof window === 'undefined') return;
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth.token');
    localStorage.removeItem('requirePasswordChange');
    localStorage.removeItem('user.name');
    localStorage.removeItem('user.position');
    // Перенаправляем на страницу логина
    try {
      window.location.href = '/login';
    } catch {
      // ignore
    }
  };
  
  const canAccess = (section: string, action: string): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    const permission = user.permissions.find(p => p.section === section);
    return permission ? (permission.actions as any).includes(action) : false;
  };

  const getUserPermissions = () => user?.permissions || [];

  const isAdmin = () => {
    if (!user) return false;
    // Проверяем, есть ли у пользователя права администратора
    return user.permissions.some(permission => 
      permission.actions.includes('manage') || 
      permission.actions.includes('delete')
    ) || user.role.includes('admin') || user.role === 'super_admin';
  };

  const refreshUser = () => {
    // Проверяем, что мы на клиенте
    if (typeof window === 'undefined') return;
    
    if (user) {
      // Получаем обновленные данные пользователя из API
      // Здесь можно добавить запрос к API для обновления данных пользователя
      console.log('Refresh user data from API');
    }
  };

  const updateAvatar = async (avatar: string) => {
    // Проверяем, что мы на клиенте
    if (typeof window === 'undefined') return;
    
    if (!user) {
      throw new Error('User not logged in');
    }

    try {
      // Обновляем аватар через API
      const response = await AuthApi.updateAvatar(avatar);
      
      if (response.success) {
        // Обновляем пользователя с новым аватаром
        const updatedUser: User = {
          ...user,
          avatar: response.avatar
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Обновляем аватар в localStorage для AvatarContext
        localStorage.setItem('user.avatar', response.avatar);
        
        // Триггерим событие storage для синхронизации между вкладками
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'user.avatar',
          newValue: response.avatar,
        }));
      }
    } catch (error) {
      console.error('Avatar update error:', error);
      throw error;
    }
  };

  const uploadAvatarFile = async (file: File) => {
    // Проверяем, что мы на клиенте
    if (typeof window === 'undefined') return;
    
    if (!user) {
      throw new Error('User not logged in');
    }

    try {
      // Загружаем файл через API
      const response = await AuthApi.uploadAvatarFile(file);
      
      if (response.success) {
        // Обновляем пользователя с новым аватаром
        const updatedUser: User = {
          ...user,
          avatar: response.avatar
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Обновляем аватар в localStorage для AvatarContext
        localStorage.setItem('user.avatar', response.avatar);
        
        // Триггерим событие storage для синхронизации между вкладками
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'user.avatar',
          newValue: response.avatar,
        }));
      }
    } catch (error) {
      console.error('Avatar file upload error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    anonymousLogin,
    logout,
    canAccess,
    getUserPermissions,
    isAdmin,
    refreshUser,
    updateAvatar,
    uploadAvatarFile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
