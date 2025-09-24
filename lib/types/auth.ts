export type Permission = {
  section: string;
  actions: ('read' | 'write' | 'delete' | 'manage')[];
};

export type User = {
  id: string;
  email: string;
  name: string;
  position?: string; // Должность пользователя
  role: string; // Роль теперь просто строка, которая приходит из API
  permissions: Permission[]; // Разрешения тоже приходят из API
  avatar?: string;
};

// Убираем все статичные роли и разрешения
// Теперь все роли и разрешения приходят из API



