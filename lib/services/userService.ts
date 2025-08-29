import { RegisteredUser, UserDatabase, INITIAL_USERS } from '@/lib/types/user';
import { UserRole } from '@/lib/types/auth';
import { generateTemporaryPassword, hashPassword, verifyPassword } from '@/lib/utils/passwordGenerator';

const USER_STORAGE_KEY = 'user_database';

class UserService {
  private getUserDatabase(): UserDatabase {
    if (typeof window === 'undefined') {
      return { users: INITIAL_USERS, nextId: INITIAL_USERS.length + 1 };
    }

    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      try {
        const db: UserDatabase = JSON.parse(stored);
        // Migration: ensure passwordHash and related fields exist for all users
        let migrated = false;
        if (Array.isArray(db.users)) {
          db.users = db.users.map((user) => {
            const updated: any = { ...user };
            const seed = INITIAL_USERS.find(s => s.email.toLowerCase() === (updated.email || '').toLowerCase());

            if (!updated.passwordHash) {
              if (seed && seed.passwordHash) {
                updated.passwordHash = seed.passwordHash;
                updated.temporaryPassword = seed.temporaryPassword;
                updated.isTemporaryPassword = seed.isTemporaryPassword ?? true;
              } else {
                const temp = generateTemporaryPassword();
                updated.passwordHash = hashPassword(temp);
                updated.temporaryPassword = temp;
                updated.isTemporaryPassword = true;
              }
              migrated = true;
            }

            if (typeof updated.isActive === 'undefined') {
              updated.isActive = true;
              migrated = true;
            }

            if (!updated.registeredAt) {
              updated.registeredAt = new Date().toISOString();
              migrated = true;
            }

            return updated as RegisteredUser;
          });
        }

        if (!db.nextId || db.nextId <= db.users.length) {
          db.nextId = db.users.length + 1;
          migrated = true;
        }

        if (migrated) {
          this.saveUserDatabase(db);
        }
        return db;
      } catch (error) {
        console.error('Error parsing user database:', error);
      }
    }

    // Инициализируем базу данных
    const initialDb: UserDatabase = {
      users: INITIAL_USERS,
      nextId: INITIAL_USERS.length + 1
    };
    this.saveUserDatabase(initialDb);
    return initialDb;
  }

  private saveUserDatabase(db: UserDatabase): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(db));
    }
  }

  // Получить всех пользователей
  getAllUsers(): RegisteredUser[] {
    return this.getUserDatabase().users;
  }

  // Найти пользователя по email
  findUserByEmail(email: string): RegisteredUser | null {
    const db = this.getUserDatabase();
    return db.users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  }

  // Зарегистрировать нового пользователя или обновить существующего
  registerUser(email: string, name: string, role: UserRole = 'student'): RegisteredUser {
    const db = this.getUserDatabase();
    const existingUser = db.users.find(user => user.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      // Обновляем последний вход
      existingUser.lastLogin = new Date().toISOString();
      existingUser.name = name;
      this.saveUserDatabase(db);
      return existingUser;
    }

    // Создаем временный пароль для нового пользователя
    const tempPassword = generateTemporaryPassword();

    // Создаем нового пользователя
    const newUser: RegisteredUser = {
      id: db.nextId.toString(),
      email: email.toLowerCase(),
      name,
      role,
      registeredAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
      passwordHash: hashPassword(tempPassword),
      temporaryPassword: tempPassword,
      isTemporaryPassword: true
    };

    db.users.push(newUser);
    db.nextId++;
    this.saveUserDatabase(db);
    return newUser;
  }

  // Обновить роль пользователя (только для супер-админа)
  updateUserRole(userId: string, newRole: UserRole): boolean {
    const db = this.getUserDatabase();
    const user = db.users.find(u => u.id === userId);

    if (!user) {
      return false;
    }

    user.role = newRole;
    this.saveUserDatabase(db);
    return true;
  }

  // Активировать/деактивировать пользователя
  toggleUserStatus(userId: string): boolean {
    const db = this.getUserDatabase();
    const user = db.users.find(u => u.id === userId);

    if (!user) {
      return false;
    }

    user.isActive = !user.isActive;
    this.saveUserDatabase(db);
    return true;
  }

  // Удалить пользователя
  deleteUser(userId: string): boolean {
    const db = this.getUserDatabase();
    const userIndex = db.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return false;
    }

    db.users.splice(userIndex, 1);
    this.saveUserDatabase(db);
    return true;
  }

  // Проверить пароль пользователя
  verifyUserPassword(email: string, password: string): RegisteredUser | null {
    const user = this.findUserByEmail(email);
    if (!user || !user.isActive) {
      return null;
    }

    if (verifyPassword(password, user.passwordHash)) {
      return user;
    }

    return null;
  }

  // Сменить пароль пользователя
  changePassword(userId: string, newPassword: string): boolean {
    const db = this.getUserDatabase();
    const user = db.users.find(u => u.id === userId);

    if (!user) {
      return false;
    }

    user.passwordHash = hashPassword(newPassword);
    user.isTemporaryPassword = false;
    user.lastPasswordChange = new Date().toISOString();
    // Убираем временный пароль после смены
    delete user.temporaryPassword;

    this.saveUserDatabase(db);
    return true;
  }

  // Сменить пароль пользователя с проверкой текущего пароля
  changePasswordWithVerification(email: string, currentPassword: string, newPassword: string): boolean {
    const db = this.getUserDatabase();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user || !user.isActive) {
      return false;
    }

    // Проверяем текущий пароль
    if (!verifyPassword(currentPassword, user.passwordHash)) {
      return false;
    }

    // Меняем пароль
    user.passwordHash = hashPassword(newPassword);
    user.isTemporaryPassword = false;
    user.lastPasswordChange = new Date().toISOString();
    // Убираем временный пароль после смены
    delete user.temporaryPassword;

    // Сохраняем изменения в базу данных
    this.saveUserDatabase(db);
    return true;
  }

  // Сгенерировать новый временный пароль (для супер-админа)
  generateNewTemporaryPassword(userId: string): string | null {
    const db = this.getUserDatabase();
    const user = db.users.find(u => u.id === userId);

    if (!user) {
      return null;
    }

    const newTempPassword = generateTemporaryPassword();
    user.passwordHash = hashPassword(newTempPassword);
    user.temporaryPassword = newTempPassword;
    user.isTemporaryPassword = true;
    
    this.saveUserDatabase(db);
    return newTempPassword;
  }

  // Получить статистику пользователей
  getUserStats() {
    const users = this.getAllUsers();
    const roleStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<UserRole, number>);

    return {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      temporaryPasswords: users.filter(u => u.isTemporaryPassword).length,
      roleStats
    };
  }
}

export const userService = new UserService();
