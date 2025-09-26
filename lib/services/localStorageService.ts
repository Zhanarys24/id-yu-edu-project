// Типы для локального хранения событий
export interface LocalEvent extends CalendarEvent {
  syncStatus: 'pending' | 'synced' | 'conflict';
  lastModified: string;
  localId?: string;
}

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

export class LocalStorageService {
  private static readonly EVENTS_KEY = 'calendar_events';
  private static readonly PENDING_SYNC_KEY = 'pending_sync';

  // Получить все события
  static getEvents(): LocalEvent[] {
    try {
      const events = localStorage.getItem(this.EVENTS_KEY);
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.error('Error getting events from localStorage:', error);
      return [];
    }
  }

  // Сохранить события
  static saveEvents(events: LocalEvent[]): void {
    try {
      localStorage.setItem(this.EVENTS_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Error saving events to localStorage:', error);
    }
  }

  // Синхронизация с разрешением конфликтов
  static async syncWithConflictResolution(): Promise<{
    success: boolean;
    conflicts: LocalEvent[];
    synced: LocalEvent[];
  }> {
    // Заглушка для синхронизации
    return {
      success: true,
      conflicts: [],
      synced: []
    };
  }
}
