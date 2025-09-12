import { extractMessageFromBackend, mapErrorToFriendlyMessage } from '../utils/errorMessages';

// Типы для календаря
export interface CalendarEvent {
  id?: string | number;
  title: string;
  start: string;
  end: string;
  color: string;
  place: string;
  isOnline: boolean;
  link?: string;
  participants: string[];
  description?: string;
  created_by?: string;
  updated_at?: string;
  created_at?: string;
}

// Типы для API создания встреч
export interface MeetingChange {
  title: string;
  date: string; // YYYY-MM-DD format
  time_start: string; // HH:MM format
  time_end: string; // HH:MM format
  campus: number;
  location: number;
  guests?: number[];
  description?: string | null;
  link?: string | null;
}

export interface CalendarUser {
  id: string | number;
  name: string;
  email: string;
  department: string;
}

export interface CalendarMeeting {
  id: string | number;
  title: string;
  start_time: string;
  end_time: string;
  location?: string;
  is_online: boolean;
  meeting_link?: string;
  participants: CalendarUser[];
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Утилита для построения URL - используем локальные API routes
const buildUrl = (path: string) => {
  // Используем локальные API routes вместо прямых запросов к внешнему API
  if (path.startsWith('auth/calendar/')) {
    const calendarPath = path.replace('auth/calendar/', '');
    // Маппинг для правильных endpoints
    if (calendarPath === 'create/meeting/') {
      return '/api/calendar/create/meeting';
    }
    if (calendarPath === 'all_meetings/') {
      return '/api/calendar/meetings';
    }
    return `/api/calendar/${calendarPath}`;
  }
  if (path.startsWith('auth/users/')) {
    return `/api/calendar/users`;
  }
  return `/api/${path}`;
};

// Утилита для получения заголовков с авторизацией
const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth.token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const CalendarService = {
  // Тестировать подключение к API
  testConnection: async (): Promise<{success: boolean, message: string, status?: number}> => {
    try {
      const url = buildUrl('auth/calendar/all_meetings/');
      console.log('Тестируем подключение к локальному API:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
      });

      const responseText = await response.text();
      console.log('Ответ локального API:', {
        status: response.status,
        contentType: response.headers.get('content-type'),
        text: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '')
      });

      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          return {
            success: true,
            message: `✅ Локальный API работает! Загружено встреч: ${Array.isArray(data) ? data.length : 'неизвестно'}`,
            status: response.status
          };
        } catch (parseError) {
          return {
            success: false,
            message: `❌ Локальный API вернул невалидный JSON. Ответ: ${responseText.substring(0, 100)}...`,
            status: response.status
          };
        }
      } else {
        return {
          success: false,
          message: `❌ Ошибка локального API: ${response.status} - ${responseText.substring(0, 100)}...`,
          status: response.status
        };
      }
    } catch (error) {
      console.error('Ошибка подключения к локальному API:', error);
      return {
        success: false,
        message: `❌ Ошибка подключения к локальному API: ${(error as Error).message}`
      };
    }
  },
  // Получить все встречи
  getAllMeetings: async (): Promise<CalendarMeeting[]> => {
    try {
      const url = buildUrl('auth/calendar/all_meetings/');
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;
        
        // Проверяем, является ли ответ HTML (обычно страница ошибки)
        if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
          errorMessage = `Сервер вернул HTML вместо JSON. Возможно, API недоступен или URL неправильный. Статус: ${response.status}`;
        } else {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = extractMessageFromBackend(errorData, response.status) || mapErrorToFriendlyMessage(errorText, response.status);
          } catch {
            errorMessage = mapErrorToFriendlyMessage(errorText, response.status);
          }
        }
        
        throw new Error(errorMessage || `Ошибка загрузки встреч (${response.status})`);
      }

      const data = await response.json();
      console.log('Загружены встречи:', data);
      
      // Преобразуем данные API в формат календаря
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Ошибка при загрузке встреч:', error);
      throw error;
    }
  },

  // Создать новую встречу
  createMeeting: async (meetingData: Omit<CalendarEvent, 'id'> & { campusId?: number, locationId?: number }): Promise<CalendarMeeting> => {
    try {
      const url = buildUrl('auth/calendar/create/meeting/');
      
      // Преобразуем данные в формат API
      const startDate = new Date(meetingData.start);
      const endDate = new Date(meetingData.end);
      
      const apiData: MeetingChange = {
        title: meetingData.title,
        date: startDate.toISOString().split('T')[0], // YYYY-MM-DD
        time_start: startDate.toTimeString().slice(0, 5), // HH:MM
        time_end: endDate.toTimeString().slice(0, 5), // HH:MM
        campus: meetingData.campusId || 1,
        location: meetingData.locationId || 1,
        guests: [], // Пока отправляем пустой массив, так как у нас нет ID пользователей
        description: meetingData.description || null,
        link: meetingData.link || null,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;
        
        // Проверяем, является ли ответ HTML (обычно страница ошибки)
        if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
          errorMessage = `Сервер вернул HTML вместо JSON. Возможно, API недоступен или URL неправильный. Статус: ${response.status}`;
        } else {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = extractMessageFromBackend(errorData, response.status) || mapErrorToFriendlyMessage(errorText, response.status);
          } catch {
            errorMessage = mapErrorToFriendlyMessage(errorText, response.status);
          }
        }
        
        throw new Error(errorMessage || `Ошибка создания встречи (${response.status})`);
      }

      const data = await response.json();
      console.log('Создана встреча:', data);
      return data;
    } catch (error) {
      console.error('Ошибка при создании встречи:', error);
      throw error;
    }
  },

  // Обновить встречу
  updateMeeting: async (id: string | number, meetingData: Partial<CalendarEvent>): Promise<CalendarMeeting> => {
    try {
      const url = buildUrl(`auth/calendar/meetings/${id}/`);
      
      const apiData: Record<string, unknown> = {};
      if (meetingData.title) apiData.title = meetingData.title;
      if (meetingData.start) apiData.start_time = meetingData.start;
      if (meetingData.end) apiData.end_time = meetingData.end;
      if (meetingData.place) apiData.location = meetingData.place;
      if (typeof meetingData.isOnline === 'boolean') apiData.is_online = meetingData.isOnline;
      if (meetingData.link !== undefined) apiData.meeting_link = meetingData.link;
      if (meetingData.participants) apiData.participants = meetingData.participants;
      if (meetingData.description !== undefined) apiData.description = meetingData.description;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = extractMessageFromBackend(errorData, response.status) || mapErrorToFriendlyMessage(errorText, response.status);
        } catch {
          errorMessage = mapErrorToFriendlyMessage(errorText, response.status);
        }
        
        throw new Error(errorMessage || `Ошибка обновления встречи (${response.status})`);
      }

      const data = await response.json();
      console.log('Обновлена встреча:', data);
      return data;
    } catch (error) {
      console.error('Ошибка при обновлении встречи:', error);
      throw error;
    }
  },

  // Удалить встречу
  deleteMeeting: async (id: string | number): Promise<void> => {
    try {
      const url = buildUrl(`auth/calendar/meetings/${id}/`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = extractMessageFromBackend(errorData, response.status) || mapErrorToFriendlyMessage(errorText, response.status);
        } catch {
          errorMessage = mapErrorToFriendlyMessage(errorText, response.status);
        }
        
        throw new Error(errorMessage || `Ошибка удаления встречи (${response.status})`);
      }

      console.log('Встреча удалена:', id);
    } catch (error) {
      console.error('Ошибка при удалении встречи:', error);
      throw error;
    }
  },

  // Получить пользователей (если есть отдельный API)
  getUsers: async (): Promise<CalendarUser[]> => {
    try {
      // Если есть отдельный API для пользователей
      const url = buildUrl('auth/users/');
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
      });

      if (!response.ok) {
        console.warn('API пользователей недоступен, возвращаем пустой массив');
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('Ошибка при загрузке пользователей:', error);
      return [];
    }
  },

  // Получить список корпусов
  getCampuses: async (): Promise<Array<{id: number, name: string}>> => {
    try {
      const url = buildUrl('auth/calendar/campuses/');
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
      });

      if (!response.ok) {
        console.warn('API корпусов недоступен, возвращаем дефолтные');
        return [
          { id: 1, name: 'Главный корпус' },
          { id: 2, name: 'Корпус А' },
          { id: 3, name: 'Корпус Б' }
        ];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('Ошибка при загрузке корпусов:', error);
      return [
        { id: 1, name: 'Главный корпус' },
        { id: 2, name: 'Корпус А' },
        { id: 3, name: 'Корпус Б' }
      ];
    }
  },

  // Получить список мест
  getLocations: async (campusId?: number): Promise<Array<{id: number, name: string, campus_id: number}>> => {
    try {
      const url = campusId 
        ? buildUrl(`auth/calendar/locations/?campus=${campusId}`)
        : buildUrl('auth/calendar/locations/');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
      });

      if (!response.ok) {
        console.warn('API мест недоступен, возвращаем дефолтные');
        return [
          { id: 1, name: 'Атриум', campus_id: 1 },
          { id: 2, name: 'Конференц-зал', campus_id: 1 },
          { id: 3, name: 'Аудитория 101', campus_id: 1 },
          { id: 4, name: 'Аудитория 201', campus_id: 2 }
        ];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('Ошибка при загрузке мест:', error);
      return [
        { id: 1, name: 'Атриум', campus_id: 1 },
        { id: 2, name: 'Конференц-зал', campus_id: 1 },
        { id: 3, name: 'Аудитория 101', campus_id: 1 },
        { id: 4, name: 'Аудитория 201', campus_id: 2 }
      ];
    }
  },

  // Преобразовать встречу API в событие календаря
  transformMeetingToEvent: (meeting: CalendarMeeting): CalendarEvent => {
    return {
      id: meeting.id,
      title: meeting.title,
      start: meeting.start_time,
      end: meeting.end_time,
      color: 'blue', // Можно добавить логику для цветов
      place: meeting.location || '',
      isOnline: meeting.is_online,
      link: meeting.meeting_link,
      participants: meeting.participants.map(p => p.email),
      description: meeting.description,
      created_by: meeting.created_by,
      created_at: meeting.created_at,
      updated_at: meeting.updated_at,
    };
  },

  // Преобразовать событие календаря в встречу API
  transformEventToMeeting: (event: CalendarEvent): Omit<CalendarMeeting, 'id' | 'created_at' | 'updated_at'> => {
    return {
      title: event.title,
      start_time: event.start,
      end_time: event.end,
      location: event.place,
      is_online: event.isOnline,
      meeting_link: event.link,
      participants: event.participants.map(email => ({
        id: email, // Временное решение, нужно получать ID пользователя
        name: email,
        email: email,
        department: '',
      })),
      description: event.description || '',
      created_by: event.created_by || 'current_user',
    };
  },
};
