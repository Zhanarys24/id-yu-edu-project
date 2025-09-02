'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Calendar, ArrowLeft } from 'lucide-react';

export default function AdminEventsPage() {
  const { user, canAccess } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!canAccess('events', 'manage')) {
      router.push('/admin');
    }
  }, [user, canAccess, router]);

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
          <div className="flex items-center gap-3 mb-4">
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
          <p className="text-gray-600">
            Подтверждение, отмена и контроль событий
          </p>
        </div>

        {/* Заглушка */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
          <Calendar size={64} className="text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Панель управления мероприятиями
          </h3>
          <p className="text-gray-600 mb-4">
            Здесь будет интерфейс для управления мероприятиями и бронированием
          </p>
          <div className="text-sm text-gray-500">
            Функциональность будет добавлена позже
          </div>
        </div>
      </div>
    </div>
  );
}

