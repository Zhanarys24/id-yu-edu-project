// Централизованная конфигурация API
export const API_CONFIG = {
  // Базовый URL для API
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://id.yu.edu.kz/api',
  
  // Заголовки по умолчанию
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Endpoints
  ENDPOINTS: {
    PERSONNEL: '/auth/calendar/personnel/',
    MEETINGS: '/auth/calendar/all_meetings/',
    USERS: '/auth/calendar/users/',
    CAMPUSES: '/auth/calendar/campuses/',
    MEETING_ROOMS: '/auth/calendar/meeting-rooms/',
    CREATE_MEETING: '/auth/calendar/create/meeting/', // ИСПРАВЛЕНО: create_meeting → create/meeting
    UPDATE_MEETING: '/auth/calendar/update/meeting/', // ИСПРАВЛЕНО: update_meeting → update/meeting
    DELETE_MEETING: '/auth/calendar/delete/meeting/', // ИСПРАВЛЕНО: delete_meeting → delete/meeting
    UPDATE_MEETING_FIELDS: '/auth/calendar/update_meeting_by_fields/',
    CSRF: '/auth/calendar/csrf/',
    CHANGE_RECOVERY_EMAIL: '/auth/change_recovery_email/'
  }
} as const;

// Утилита для построения полного URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Утилита для получения заголовков с авторизацией
export const getApiHeaders = (additionalHeaders: Record<string, string> = {}): Record<string, string> => {
  return {
    ...API_CONFIG.DEFAULT_HEADERS,
    ...additionalHeaders
  };
};
