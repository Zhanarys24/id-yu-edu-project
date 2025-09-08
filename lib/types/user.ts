import { UserRole } from './auth';
import { generateTemporaryPassword, hashPassword } from '../utils/passwordGenerator';

export type RegisteredUser = {
  id: string;
  email: string;
  name: string;
  position?: string; // Должность пользователя
  role: UserRole;
  registeredAt: string;
  lastLogin?: string;
  isActive: boolean;
  passwordHash: string;
  temporaryPassword?: string; // Временный пароль в открытом виде (только для супер-админа)
  isTemporaryPassword: boolean; // Нужно ли сменить пароль
  lastPasswordChange?: string;
};

export type UserDatabase = {
  users: RegisteredUser[];
  nextId: number;
};

// Начальная база данных пользователей
export const INITIAL_USERS: RegisteredUser[] = [
  {
    id: '1',
    email: 'super@admin.com',
    name: 'Абыков Мирас',
    position: 'Директор IT-департамента',
    role: 'super_admin',
    registeredAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
    isActive: true,
    passwordHash: hashPassword('admin123'),
    temporaryPassword: 'admin123',
    isTemporaryPassword: false,
    lastPasswordChange: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'news@admin.com',
    name: 'Асель Толеуова',
    position: 'Менеджер по коммуникациям',
    role: 'admin_news',
    registeredAt: '2024-01-01T00:00:00Z',
    isActive: true,
    passwordHash: hashPassword('news123'),
    temporaryPassword: 'news123',
    isTemporaryPassword: true
  },
  {
    id: '3',
    email: 'portfolio@admin.com',
    name: 'Данияр Касымов',
    position: 'Координатор академических программ',
    role: 'admin_portfolio',
    registeredAt: '2024-01-01T00:00:00Z',
    isActive: true,
    passwordHash: hashPassword('port123'),
    temporaryPassword: 'port123',
    isTemporaryPassword: true
  },
  {
    id: '4',
    email: 'student@yu.edu.kz',
    name: 'Алмас Жумабеков',
    position: 'Студент 3 курса',
    role: 'student',
    registeredAt: '2024-01-01T00:00:00Z',
    isActive: true,
    passwordHash: hashPassword('stud123'),
    temporaryPassword: 'stud123',
    isTemporaryPassword: true
  },
  {
    id: '5',
    email: 'events@admin.com',
    name: 'Жанар Сейтжанова',
    position: 'Организатор мероприятий',
    role: 'admin_events',
    registeredAt: '2024-01-01T00:00:00Z',
    isActive: true,
    passwordHash: hashPassword('event123'),
    temporaryPassword: 'event123',
    isTemporaryPassword: true
  }
];
