'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Permission, ROLE_PERMISSIONS } from '@/lib/types/auth';
import { userService } from '@/lib/services/userService';

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  canAccess: (section: string, action: string) => boolean;
  getUserPermissions: () => Permission[];
  isAdmin: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Проверяем пароль
      const registeredUser = userService.verifyUserPassword(email, password);
      
      if (!registeredUser) {
        throw new Error('Неверный email или пароль.');
      }

      if (!registeredUser.isActive) {
        throw new Error('Аккаунт заблокирован. Обратитесь к администратору.');
      }

      // Обновляем время последнего входа
      userService.registerUser(email, registeredUser.name, registeredUser.role);

      const rolePermissions = ROLE_PERMISSIONS?.[registeredUser.role] || [];
      if (!ROLE_PERMISSIONS || !ROLE_PERMISSIONS[registeredUser.role]) {
        console.warn('ROLE_PERMISSIONS missing for role:', registeredUser.role);
      }

      const newUser: User = {
        id: registeredUser.id,
        email: registeredUser.email,
        name: registeredUser.name,
        role: registeredUser.role,
        permissions: rolePermissions,
        avatar: '/avatar.jpg'
      };

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Проверяем, нужно ли сменить пароль
      if (registeredUser.isTemporaryPassword) {
        localStorage.setItem('requirePasswordChange', 'true');
      }
    } catch (error) {
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasRole = (role: UserRole) => user?.role === role;
  
  const canAccess = (section: string, action: string): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    const permission = user.permissions.find(p => p.section === section);
    return permission ? permission.actions.includes(action as any) : false;
  };

  const getUserPermissions = () => user?.permissions || [];

  const isAdmin = () => {
    return user && user.role !== 'student';
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    hasRole,
    canAccess,
    getUserPermissions,
    isAdmin
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
