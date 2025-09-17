'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, ArrowLeft, Edit, Trash2, RefreshCw } from 'lucide-react';
import { CalendarService } from '@/lib/services/calendarService';

interface Meeting {
  id: number
  title: string
  date: string
  time_start: string
  time_end: string
  campus: number
  location: number
  guests: number[]
  description?: string
  link?: string
}

export default function AdminEventsPage() {
  const { user, canAccess } = useAuth();
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    if (!canAccess('events', 'manage')) {
      router.push('/admin');
    }
  }, [user, canAccess, router]);

  // Загружаем мероприятия
  const loadMeetings = async () => {
    try {
      setLoading(true);
      const data = await CalendarService.getAllMeetings();
      setMeetings(data);
    } catch (error) {
      console.error('Ошибка при загрузке мероприятий:', error);
      showToast('Ошибка при загрузке мероприятий', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canAccess('events', 'manage')) {
      loadMeetings();
    }
  }, [canAccess]);

  // Удаление мероприятия
  const handleDelete = async (meeting: Meeting) => {
    try {
      await CalendarService.deleteMeeting(meeting.id);
      
      // Обновляем локальное состояние
      setMeetings(meetings.filter(m => m.id !== meeting.id));
      showToast('Мероприятие успешно удалено');
      setShowDeleteModal(false);
      setMeetingToDelete(null);
    } catch (error) {
      console.error('Ошибка при удалении мероприятия:', error);
      showToast('Ошибка при удалении мероприятия', 'error');
    }
  };

  // Редактирование мероприятия
  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (!editingMeeting) return;
      
      console.log('🔄 Сохраняем изменения для мероприятия:', editingMeeting);
      console.log(' ID мероприятия:', editingMeeting.id);
      console.log('📋 Тип ID:', typeof editingMeeting.id);
      console.log(' Есть ли реальный ID:', editingMeeting.has_real_id);
      
      // Проверяем, что ID существует
      if (!editingMeeting.id) {
        console.error('❌ ID мероприятия не найден!');
        showToast('Ошибка: ID мероприятия не найден', 'error');
        return;
      }
      
      // ВСЕГДА используем updateMeeting с реальным ID
      console.log('✅ Используем updateMeeting с ID');
      
      // Данные для обновления (исключаем служебные поля)
      const { id, has_real_id, temp_id, original_index, ...meetingData } = editingMeeting;
      
      console.log('📤 Отправляем данные с ID:', { id, meetingData });
      
      // Используем ТОЛЬКО updateMeeting
      await CalendarService.updateMeeting(id, meetingData);
      
      // Перезагружаем данные с сервера
      await loadMeetings();
      
      showToast('Мероприятие успешно обновлено');
      setShowEditModal(false);
      setEditingMeeting(null);
    } catch (error) {
      console.error('Ошибка при обновлении мероприятия:', error);
      showToast('Ошибка при обновлении мероприятия', 'error');
    }
  };

  if (!canAccess('events', 'manage')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Доступ запрещен</h2>
          <p className="text-gray-600">У вас нет прав для просмотра этой страницы</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <Calendar size={32} className="text-green-500" />
              <h1 className="text-3xl font-bold text-gray-900">
                Управление мероприятиями
              </h1>
            </div>
            <button
              onClick={loadMeetings}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Обновить
            </button>
          </div>
          <p className="text-gray-600">
            Подтверждение, отмена и контроль событий
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка мероприятий...</p>
          </div>
        ) : (
          <>
            {/* Список мероприятий */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Название
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дата
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Время
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Корпус
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Место
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {meetings.map((meeting) => (
                      <tr key={meeting.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {meeting.title}
                          </div>
                          {meeting.description && (
                            <div className="text-sm text-gray-500">
                              {meeting.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {meeting.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {meeting.time_start} - {meeting.time_end}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Корпус {meeting.campus}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Место {meeting.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(meeting)}
                              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit size={14} />
                              Редактировать
                            </button>
                            <button
                              onClick={() => {
                                setMeetingToDelete(meeting);
                                setShowDeleteModal(true);
                              }}
                              className="flex items-center gap-1 text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={14} />
                              Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {meetings.length === 0 && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
                <Calendar size={64} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Мероприятия не найдены
                </h3>
                <p className="text-gray-600">
                  В системе пока нет мероприятий для управления
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Модальное окно редактирования */}
      {showEditModal && editingMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Редактировать мероприятие</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  value={editingMeeting.title}
                  onChange={(e) => setEditingMeeting({
                    ...editingMeeting,
                    title: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата
                </label>
                <input
                  type="date"
                  value={editingMeeting.date}
                  onChange={(e) => setEditingMeeting({
                    ...editingMeeting,
                    date: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Время начала
                  </label>
                  <input
                    type="time"
                    value={editingMeeting.time_start}
                    onChange={(e) => setEditingMeeting({
                      ...editingMeeting,
                      time_start: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Время окончания
                  </label>
                  <input
                    type="time"
                    value={editingMeeting.time_end}
                    onChange={(e) => setEditingMeeting({
                      ...editingMeeting,
                      time_end: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={editingMeeting.description || ''}
                  onChange={(e) => setEditingMeeting({
                    ...editingMeeting,
                    description: e.target.value
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingMeeting(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно удаления */}
      {showDeleteModal && meetingToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Удалить мероприятие</h2>
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите удалить мероприятие "{meetingToDelete.title}"?
              Это действие нельзя отменить.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setMeetingToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDelete(meetingToDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast уведомления */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

