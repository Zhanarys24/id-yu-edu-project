// Новый чистый calendarService.ts с интеграцией вашего API

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

// Типы для вашего API участников
export interface ExternalParticipant {
  id: number;
  full_name: string;
  work_phone: string | null;
}

export interface ExternalParticipantsResponse {
  count: number;
  size: number;
  next: string | null;
  previous: string | null;
  results: ExternalParticipant[];
}

// Тип для совместимости с существующим кодом
export interface PersonnelSimple {
  id: number;
  full_name: string;
  work_phone?: string;
}

// Типы для пользователей (для совместимости)
export interface CalendarUser {
  id: string | number;
  name: string;
  email: string;
  department: string;
}

// Типы для корпусов
export interface Campus {
  id: number;
  name: string;
}

// Типы для мест встреч
export interface MeetingRoom {
  id: number;
  name: string;
  campus: number;
}

// Базовый URL для вашего API
const EXTERNAL_API_BASE = 'https://8af0cec014ee.ngrok-free.app';

// Утилита для получения заголовков
const getHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Для обхода предупреждения ngrok
  };
};

export const CalendarService = {
  // Получить участников через наш API route (без CORS проблем)
  getExternalParticipants: async (page: number = 1, pageSize: number = 100): Promise<ExternalParticipantsResponse> => {
    try {
      const url = `/api/calendar/personnel?page=${page}&size=${pageSize}`;
      console.log('🔄 Загружаем участников через API route:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ExternalParticipantsResponse = await response.json();
      console.log(`✅ Загружено участников: ${data.results.length} из ${data.count}`);
      return data;
    } catch (error) {
      console.error('❌ Ошибка при загрузке участников:', error);
      throw error;
    }
  },

  // Получить всех участников (с пагинацией и сортировкой)
  getAllExternalParticipants: async (): Promise<ExternalParticipant[]> => {
    try {
      const allParticipants: ExternalParticipant[] = [];
      let page = 1;
      let hasMore = true;

      console.log('🚀 Начинаем загрузку всех участников...');

      while (hasMore) {
        console.log(`📄 Загружаем страницу ${page}...`);
        const response = await CalendarService.getExternalParticipants(page, 100);
        allParticipants.push(...response.results);
        
        hasMore = response.next !== null;
        page++;
        
        // Защита от бесконечного цикла
        if (page > 50) {
          console.warn('⚠️ Достигнут лимит страниц (50), прерываем загрузку');
          break;
        }
      }

      // Сортируем участников по алфавиту
      const sortedParticipants = allParticipants.sort((a, b) => {
        return a.full_name.localeCompare(b.full_name, 'ru', { 
          numeric: true, 
          sensitivity: 'base' 
        });
      });

      console.log(`✅ Всего загружено и отсортировано участников: ${sortedParticipants.length}`);
      return sortedParticipants;
    } catch (error) {
      console.error('❌ Ошибка при загрузке всех участников:', error);
      throw error;
    }
  },

  // Преобразовать внешнего участника в PersonnelSimple для совместимости
  transformExternalToPersonnel: (external: ExternalParticipant): PersonnelSimple => {
    return {
      id: external.id,
      full_name: external.full_name,
      work_phone: external.work_phone || undefined,
    };
  },

  // Тестировать подключение к вашему API
  testConnection: async (): Promise<{success: boolean, message: string, status?: number}> => {
    try {
      const url = `/api/calendar/personnel?page=1&size=5`;
      console.log('🧪 Тестируем подключение через API route:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      const responseText = await response.text();
      console.log('📡 Ответ API route:', {
        status: response.status,
        text: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '')
      });

      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          return {
            success: true,
            message: `✅ API работает! Найдено участников: ${data.count || 'неизвестно'}`,
            status: response.status
          };
        } catch (parseError) {
          return {
            success: false,
            message: `❌ API вернул невалидный JSON. Ответ: ${responseText.substring(0, 100)}...`,
            status: response.status
          };
        }
      } else {
        return {
          success: false,
          message: `❌ Ошибка API: ${response.status} - ${responseText.substring(0, 100)}...`,
          status: response.status
        };
      }
    } catch (error) {
      console.error('❌ Ошибка подключения к API route:', error);
      return {
        success: false,
        message: `❌ Ошибка подключения: ${(error as Error).message}`
      };
    }
  },

  // Заглушки для совместимости с существующим кодом
  // Эти методы можно будет реализовать позже или удалить если не нужны
  
  getAllMeetings: async (): Promise<any[]> => {
    console.log('⚠️ getAllMeetings не реализован - возвращаем пустой массив');
    return [];
  },

  getUsers: async (): Promise<CalendarUser[]> => {
    console.log('⚠️ getUsers не реализован - возвращаем пустой массив');
    return [];
  },

  getPersonnel: async (): Promise<PersonnelSimple[]> => {
    console.log('⚠️ getPersonnel не реализован - используйте getAllExternalParticipants');
    return [];
  },

  getCampuses: async (): Promise<Campus[]> => {
    try {
      console.log('🏢 Загружаем корпуса...');
      const response = await fetch('/api/calendar/campuses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const campuses = await response.json();
      console.log('✅ Загружено корпусов:', campuses.length);
      console.log('📋 Корпуса:', campuses);
      return campuses;
    } catch (error) {
      console.error('❌ Ошибка при загрузке корпусов:', error);
      return [];
    }
  },

  getMeetingRooms: async (): Promise<MeetingRoom[]> => {
    console.log('⚠️ getMeetingRooms не реализован - возвращаем пустой массив');
    return [];
  },

  getLocations: async (campusId?: number): Promise<Array<{id: number, name: string, campus_id: number}>> => {
    try {
      console.log(' Загружаем места встреч...', campusId ? `для корпуса ${campusId}` : 'все места');
      
      const url = campusId 
        ? `/api/calendar/meeting-rooms?campus=${campusId}`
        : '/api/calendar/meeting-rooms';
        
      console.log(' URL для загрузки мест:', url);
        
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Статус ответа API мест:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const meetingRooms = await response.json();
      console.log('📋 Получены места встреч из API:', meetingRooms);
      
      // Преобразуем формат данных из API в формат, ожидаемый компонентом
      const locations = meetingRooms.map(room => ({
        id: room.id,
        name: room.name,
        campus_id: room.campus
      }));
      
      console.log('✅ Загружено мест встреч:', locations.length);
      console.log('📋 Преобразованные места:', locations);
      return locations;
    } catch (error) {
      console.error('❌ Ошибка при загрузке мест встреч:', error);
      return [];
    }
  },

  createMeeting: async (meetingData: any): Promise<any> => {
    try {
      console.log('📅 Создаем встречу...');
      console.log('📋 Данные встречи:', meetingData);
      
      const response = await fetch('/api/calendar/create/meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
      });

      console.log('📡 Статус ответа API создания встречи:', response.status);
      console.log('📡 Headers ответа:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // Сначала получаем текст ответа
        const responseText = await response.text();
        console.log('📡 Текст ошибки:', responseText);
        
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        // Пытаемся распарсить JSON только если есть содержимое
        if (responseText.trim()) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage += `, message: ${errorData.details || errorData.error || responseText}`;
          } catch (parseError) {
            errorMessage += `, message: ${responseText}`;
          }
        }
        
        console.error('❌ Полная ошибка:', errorMessage);
        throw new Error(errorMessage);
      }

      // Проверяем, есть ли содержимое в успешном ответе
      const responseText = await response.text();
      console.log('📡 Текст успешного ответа:', responseText);
      
      if (!responseText.trim()) {
        console.log('⚠️ Пустой ответ от API');
        throw new Error('Пустой ответ от сервера');
      }
      
      try {
        const result = JSON.parse(responseText);
        console.log('✅ Встреча создана успешно:', result);
        return result;
      } catch (parseError) {
        console.error('❌ Ошибка парсинга JSON:', parseError);
        console.log('📡 Полный ответ:', responseText);
        throw new Error(`Ошибка парсинга ответа: ${parseError.message}`);
      }
      
    } catch (error) {
      console.error('❌ Ошибка при создании встречи:', error);
      throw error;
    }
  },

  transformMeetingToEvent: (meeting: any): CalendarEvent => {
    console.log('⚠️ transformMeetingToEvent не реализован');
    return {
      id: meeting.id || Date.now(),
      title: meeting.title || 'Без названия',
      start: meeting.start_time || new Date().toISOString(),
      end: meeting.end_time || new Date().toISOString(),
      color: 'blue',
      place: meeting.location || 'Не указано',
      isOnline: meeting.is_online || false,
      link: meeting.meeting_link || '',
      participants: meeting.participants || [],
      description: meeting.description || '',
      created_by: meeting.created_by || 'unknown',
    };
  },
};