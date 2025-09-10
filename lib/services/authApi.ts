export type LoginResponse = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  position?: string;
  avatarUrl?: string;
  token?: string;
  [key: string]: any;
};

import { extractMessageFromBackend, mapErrorToFriendlyMessage } from '../utils/errorMessages';

// утилита для безопасного построения URL без двойных слэшей
const buildUrl = (path: string) => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
};

export const AuthApi = {
  // 🔑 Логин через TokenAuthentication
  login: async (username: string, password: string): Promise<LoginResponse> => {
    // Use Next.js auth proxy to ensure auth cookie is set for middleware
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    });

    const contentType = res.headers.get('content-type') || '';
    const text = await res.text().catch(() => '');

    if (!res.ok) {
      let msg: string | undefined;
      try { msg = text ? extractMessageFromBackend(JSON.parse(text), res.status) : undefined } catch {}
      // Специальный кейс: невалидные учётные данные
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        throw new Error('Неправильный логин или пароль');
      }
      throw new Error(msg || mapErrorToFriendlyMessage(text || `Login failed (${res.status})`, res.status));
    }
    if (!contentType.includes('application/json')) {
      throw new Error('Сервис авторизации вернул неверный формат ответа');
    }

    const data: LoginResponse = JSON.parse(text);

    // ✅ сохраняем токен (из proxy приходит как access_token)
    if ((data as any).access_token) {
      localStorage.setItem('auth.token', String((data as any).access_token));
    } else if (data.token) {
      localStorage.setItem('auth.token', data.token);
    }

    return data;
  },

  // 🔑 Профиль
  profile: async (): Promise<any> => {
    // Use Next.js proxy which authenticates via cookie set at login
    const res = await fetch('/api/auth/profile', { cache: 'no-store' });

    const text = await res.text().catch(() => '');
    if (!res.ok) {
      let msg: string | undefined;
      try { msg = text ? extractMessageFromBackend(JSON.parse(text), res.status) : undefined } catch {}
      throw new Error(msg || mapErrorToFriendlyMessage(text || `Profile failed (${res.status})`, res.status));
    }

    return JSON.parse(text);
  },

  // 🔑 Смена пароля
  changePassword: async (current_password: string, new_password: string) => {
    // Используем Next.js proxy, который сам проверяет текущий пароль и авторизует по кукам
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password, new_password }),
      cache: 'no-store',
    });

    const contentType = res.headers.get('content-type') || '';
    const text = await res.text().catch(() => '');

    if (!res.ok) {
      // Если пришёл JSON — попробуем извлечь понятное сообщение, иначе отдаём текст как есть
      let friendly: string | undefined;
      if (contentType.includes('application/json')) {
        try { friendly = extractMessageFromBackend(JSON.parse(text), res.status) } catch {}
      }
      throw new Error(friendly || text || mapErrorToFriendlyMessage('Не удалось сменить пароль', res.status));
    }

    // Успех: обычно приходит JSON от бэкенда
    if (contentType.includes('application/json')) {
      return JSON.parse(text);
    }
    return { success: true } as any;
  },

  // 🔑 Обновление аватара (base64 или URL)
  updateAvatar: async (avatar: string): Promise<{ success: boolean; avatar: string; message: string }> => {
    const token = localStorage.getItem('auth.token');
    if (!token) throw new Error('Необходима авторизация. Войдите в систему.');

    const res = await fetch(buildUrl('/api/users/change_image/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({ image: avatar }),
    });

    const text = await res.text().catch(() => '');
    if (!res.headers.get('content-type')?.includes('application/json')) {
      throw new Error(mapErrorToFriendlyMessage('Сервис обновления аватара недоступен', res.status));
    }

    const data = JSON.parse(text);
    if (!res.ok) {
      const msg = extractMessageFromBackend(data, res.status) || mapErrorToFriendlyMessage('Не удалось обновить аватар', res.status);
      throw new Error(msg);
    }

    return {
      success: true,
      avatar: data.image || data.avatar || data.profile_image || avatar,
      message: 'Аватар обновлён успешно',
    };
  },

  // 🔑 Загрузка файла аватара (FormData)
  uploadAvatarFile: async (file: File): Promise<{ success: boolean; avatar: string; message: string }> => {
    const token = localStorage.getItem('auth.token');
    if (!token) throw new Error('Необходима авторизация. Войдите в систему.');

    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(buildUrl('/api/users/change_image/'), {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
      },
      body: formData,
    });

    const text = await res.text().catch(() => '');
    if (!res.headers.get('content-type')?.includes('application/json')) {
      throw new Error(mapErrorToFriendlyMessage('Сервис загрузки аватара недоступен', res.status));
    }

    const data = JSON.parse(text);
    if (!res.ok) {
      const msg = extractMessageFromBackend(data, res.status) || mapErrorToFriendlyMessage('Не удалось загрузить аватар', res.status);
      throw new Error(msg);
    }

    return {
      success: true,
      avatar: data.image || data.avatar || data.profile_image || '',
      message: 'Аватар загружен успешно',
    };
  },

  // 🔑 Logout
  logout: async () => {
    const token = localStorage.getItem('auth.token');

    // Сначала чистим cookie через наш Next.js proxy, чтобы middleware посчитал пользователя неавторизованным
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}

    // Затем пытаемся сообщить бэкенду (если есть токен)
    if (token) {
      const res = await fetch(buildUrl('/api/users/logout/'), {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        // Не мешаем логауту из-за ошибки бэкенда; просто логируем при необходимости
        console.warn('Backend logout failed:', text || res.status);
      }
    }

    localStorage.removeItem('auth.token');

    return { success: true };
  },
};
