'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Permission, ROLE_PERMISSIONS } from '@/lib/types/auth';
import { userService } from '@/lib/services/userService';
import { AuthApi } from '@/lib/services/authApi';

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  anonymousLogin: () => boolean;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
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
      
      // Обновляем данные пользователя из базы данных при загрузке
      const updatedUser = userService.findUserByEmail(parsedUser.email);
      if (updatedUser && (updatedUser.name !== parsedUser.name || updatedUser.position !== parsedUser.position)) {
        const rolePermissions = ROLE_PERMISSIONS?.[updatedUser.role] || [];
        
        const refreshedUser: User = {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          position: updatedUser.position,
          role: updatedUser.role,
          permissions: rolePermissions,
          avatar: parsedUser.avatar
        };

        setUser(refreshedUser);
        localStorage.setItem('user', JSON.stringify(refreshedUser));
        
        // Also update individual localStorage items for AvatarContext
        localStorage.setItem('user.name', refreshedUser.name);
        if (refreshedUser.position) {
          localStorage.setItem('user.position', refreshedUser.position);
        }
      }
    }
  }, []);

  const anonymousLogin = () => {
    // Проверяем, что мы на клиенте
    if (typeof window === 'undefined') return false;
    
    const rolePermissions = ROLE_PERMISSIONS?.['anonymous'] || [];
    
    const anonymousUser: User = {
      id: 'anonymous',
      email: 'anonymous@yu.edu.kz',
      name: 'Аноним',
      position: 'Гость',
      role: 'anonymous',
      permissions: rolePermissions,
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
  
      // Определяем роль: сначала из profile, потом из resp, потом по умолчанию
      let role: UserRole = 'student';
      
      // Проверяем profile на наличие роли
      if (profile?.role) {
        role = profile.role as UserRole;
        console.log('Роль из profile:', role);
      } else if (resp.role) {
        role = resp.role as UserRole;
        console.log('Роль из resp:', role);
      } else {
        // Если роль не найдена, проверяем по email или другим полям
        console.log('Роль не найдена в API ответе, используем логику определения роли');
        
        // Здесь можно добавить логику определения роли по email или другим полям
        if (email === 'super@admin.com' || email === 'zhanarys') {
          role = 'super_admin';
          console.log('Установлена роль super_admin для:', email);
        }
      }
      
      const rolePermissions = ROLE_PERMISSIONS?.[role] || [];
      if (!ROLE_PERMISSIONS || !ROLE_PERMISSIONS[role]) {
        console.warn('ROLE_PERMISSIONS missing for role:', role);
      }
  
      // Use data from login response first, then profile response
      const firstName = resp.first_name || profile?.first_name || 'User';
      const lastName = resp.last_name || profile?.last_name || '';
      const fullName = lastName ? `${firstName} ${lastName}` : firstName;
      const username = resp.username || profile?.username || email;
      const avatar = resp.avatar || profile?.avatar || '/avatar.jpg';
      
      console.log('Avatar sources:', { 
        respAvatar: resp.avatar, 
        profileAvatar: profile?.avatar, 
        finalAvatar: avatar 
      });
  
      const newUser: User = {
        id: String(resp.id ?? profile?.id ?? 'unknown'),
        email: email,
        name: fullName,
        position: resp.position || profile?.position || 'User',
        role,
        permissions: rolePermissions,
        avatar: avatar
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

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case 'admin_news': return 'Админ новостей';
      case 'admin_events': return 'Админ мероприятий';
      case 'admin_education': return 'Админ образования';
      case 'admin_eservices': return 'Админ Е-услуг';
      case 'admin_yessenovai': return 'Админ YessenovAI';
      case 'admin_gamification': return 'Админ YU-Gamification';
      case 'admin_portfolio': return 'Админ портфолио';
      case 'super_admin': return 'Супер администратор';
      default: return 'Студент';
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

  const hasRole = (role: UserRole) => user?.role === role;
  
  const canAccess = (section: string, action: string): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    const permission = user.permissions.find(p => p.section === section);
    return permission ? (permission.actions as any).includes(action) : false;
  };

  const getUserPermissions = () => user?.permissions || [];

  const isAdmin = () => {
    return !!user && user.role !== 'student' && user.role !== 'anonymous';
  };

  const refreshUser = () => {
    // Проверяем, что мы на клиенте
    if (typeof window === 'undefined') return;
    
    if (user) {
      // Получаем обновленные данные пользователя из базы данных
      const updatedUser = userService.findUserByEmail(user.email);
      if (updatedUser) {
        const rolePermissions = ROLE_PERMISSIONS?.[updatedUser.role] || [];
        
        const refreshedUser: User = {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          position: updatedUser.position,
          role: updatedUser.role,
          permissions: rolePermissions,
          avatar: user.avatar // Сохраняем текущий аватар
        };

        setUser(refreshedUser);
        localStorage.setItem('user', JSON.stringify(refreshedUser));
        
        // Also update individual localStorage items for AvatarContext
        localStorage.setItem('user.name', refreshedUser.name);
        if (refreshedUser.position) {
          localStorage.setItem('user.position', refreshedUser.position);
        }
        if (refreshedUser.avatar) {
          localStorage.setItem('user.avatar', refreshedUser.avatar);
        }
      }
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
    hasRole,
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
