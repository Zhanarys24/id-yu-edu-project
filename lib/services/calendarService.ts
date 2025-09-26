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

// Добавляем интерфейсы в начало файла
interface MeetingData {
  title: string;
  date: string;
  time_start: string;
  time_end: string;
  campus: string;
  location: string;
  description?: string;
  participants?: string[];
  [key: string]: unknown;
}

interface SearchFields {
  campus: string;
  location: string;
  date: string;
  time_start: string;
  time_end: string;
  [key: string]: unknown;
}

interface UpdatedData {
  [key: string]: unknown;
}

interface Meeting {
  id: number;
  title: string;
  date: string;
  time_start: string;
  time_end: string;
  campus: string;
  location: string;
  description?: string;
  participants?: string[];
  start_time?: string;
  end_time?: string;
  guests?: string[];
  created_by?: string;
  updated_at?: string;
  created_at?: string;
  [key: string]: unknown;
}

// Импортируем конфигурацию API
import { API_CONFIG, buildApiUrl, getApiHeaders } from '../config/api';

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

      // Дедупликация по ID перед сортировкой
      const uniqueParticipants = allParticipants.reduce((unique, participant) => {
        const exists = unique.some(p => p.id === participant.id);
        if (!exists) {
          unique.push(participant);
        }
        return unique;
      }, [] as ExternalParticipant[]);

      // Сортируем участников по алфавиту
      const sortedParticipants = uniqueParticipants.sort((a, b) => {
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
  
  getAllMeetings: async (): Promise<Meeting[]> => {
    try {
      console.log(' Загружаем все встречи из API...');
      
      const response = await fetch('/api/calendar/meetings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error('❌ Ошибка при загрузке встреч:', response.status);
        return [];
      }

      const data = await response.json();
      console.log('✅ Встречи загружены:', data);
      
      return data.results || data || [];
      
    } catch (error) {
      console.error('❌ Ошибка при загрузке встреч:', error);
      return [];
    }
  },

  getUsers: async (): Promise<CalendarUser[]> => {
    try {
      console.log('🔄 Загружаем пользователей из API...');
      
      const response = await fetch('/api/calendar/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error('❌ Ошибка при загрузке пользователей:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Загружено пользователей:', data.length || 0);
      console.log('📋 Данные пользователей:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Ошибка при загрузке пользователей:', error);
      return [];
    }
  },

  getPersonnel: async (): Promise<PersonnelSimple[]> => {
    try {
      console.log('🔄 Загружаем персонал из API...');
      
      const response = await fetch('/api/calendar/personnel', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error('❌ Ошибка при загрузке персонала:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Загружено персонала:', data.length || 0);
      console.log('📋 Данные персонала:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Ошибка при загрузке персонала:', error);
      return [];
    }
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

      // Исправление 1: Добавляем типизацию для meetingRooms
      const meetingRooms: MeetingRoom[] = await response.json();
      console.log('📋 Получены места встреч из API:', meetingRooms);
      
      // Преобразуем формат данных из API в формат, ожидаемый компонентом
      const locations = meetingRooms.map((room: MeetingRoom) => ({
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

  createMeeting: async (meetingData: MeetingData): Promise<Meeting> => {
    try {
      console.log('📅 Создаем встречу...');
      console.log('📋 Данные встречи:', meetingData);
      
      // Валидация данных перед отправкой
      const requiredFields = ['title', 'date', 'time_start', 'time_end', 'campus', 'location'];
      const missingFields = requiredFields.filter(field => !meetingData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Отсутствуют обязательные поля: ${missingFields.join(', ')}`);
      }
      
      const response = await fetch('/api/calendar/create/meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Ошибка при создании встречи:', response.status, errorText);
        throw new Error(`Ошибка создания встречи: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Встреча создана:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Ошибка при создании встречи:', error);
      throw error;
    }
  },

  transformMeetingToEvent: (meeting: Meeting): CalendarEvent => {
    console.log('⚠️ Преобразуем встречу в событие календаря:', meeting);
    
    // Формируем правильные даты из отдельных полей
    let startDateTime: string;
    let endDateTime: string;
    
    if (meeting.start_time && meeting.end_time) {
      // Если API вернул готовые datetime поля
      startDateTime = meeting.start_time;
      endDateTime = meeting.end_time;
    } else if (meeting.date && meeting.time_start && meeting.time_end) {
      // Если API вернул отдельные поля date, time_start, time_end
      startDateTime = `${meeting.date}T${meeting.time_start}`;
      endDateTime = `${meeting.date}T${meeting.time_end}`;
    } else {
      // Fallback - используем текущую дату
      const today = new Date().toISOString().split('T')[0];
      startDateTime = `${today}T09:00:00`;
      endDateTime = `${today}T10:00:00`;
    }

    // Исправление 2: Убираем allDay и extendedProps, добавляем обязательные поля
    return {
      id: meeting.id.toString(),
      title: meeting.title || 'Без названия',
      start: startDateTime,
      end: endDateTime,
      color: '#3B82F6',
      place: meeting.location || '',
      isOnline: false,
      participants: meeting.participants || meeting.guests || [],
      description: meeting.description || '',
      created_by: meeting.created_by || 'unknown',
      updated_at: meeting.updated_at,
      created_at: meeting.created_at,
    };
  },

  // Обновить мероприятие по ID
  updateMeeting: async (id: number, meetingData: MeetingData): Promise<Meeting> => {
    try {
      console.log('🔄 Обновляем мероприятие по ID:', id);
      console.log('📋 Данные для обновления:', meetingData);
      
      const response = await fetch('/api/calendar/update/meeting', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...meetingData }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Ошибка при обновлении встречи:', response.status, errorText);
        throw new Error(`Ошибка обновления встречи: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Встреча обновлена:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Ошибка при обновлении встречи:', error);
      throw error;
    }
  },

  // Удалить мероприятие
  deleteMeeting: async (id: number): Promise<void> => {
    try {
      console.log('🔄 Удаляем мероприятие:', id);
      
      const response = await fetch(`/api/calendar/delete/meeting?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('❌ Ошибка при удалении мероприятия:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Мероприятие удалено');
    } catch (error) {
      console.error('❌ Ошибка при удалении мероприятия:', error);
      throw error;
    }
  },

  // Обновить мероприятие по полям
  updateMeetingByFields: async (searchFields: SearchFields, updatedData: UpdatedData): Promise<Meeting> => {
    try {
      console.log(' Обновляем мероприятие по полям...');
      console.log('🔍 Поисковые поля:', searchFields);
      console.log(' Данные для обновления:', updatedData);
      
      const response = await fetch('/api/calendar/update/meeting-by-fields', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchFields, updatedData }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Ошибка при обновлении встречи по полям:', response.status, errorText);
        throw new Error(`Ошибка обновления встречи: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Встреча обновлена по полям:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Ошибка при обновлении встречи по полям:', error);
      throw error;
    }
  },
};