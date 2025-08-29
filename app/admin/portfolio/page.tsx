'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FileUser, Search, Edit, Trash2, Eye, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

type PortfolioItem = {
  id: string;
  userId: string;
  userName: string;
  type: 'general' | 'publications' | 'teaching' | 'achievements' | 'additional';
  title: string;
  description: string;
  date: string;
  status: 'active' | 'pending' | 'rejected';
};

export default function AdminPortfolioPage() {
  const { user, canAccess } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    if (!canAccess('portfolio', 'manage')) {
      router.push('/admin');
    }
  }, [user, canAccess, router]);

  // Загружаем мок данные при монтировании компонента
  useEffect(() => {
    const mockPortfolioItems: PortfolioItem[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'Алиев Али Алиевич',
        type: 'achievements',
        title: 'Победа в олимпиаде по математике',
        description: 'Занял первое место в республиканской олимпиаде по математике среди студентов технических специальностей',
        date: '2024-01-15',
        status: 'active'
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Бекова Беке Бековна',
        type: 'publications',
        title: 'Научная статья по физике',
        description: 'Публикация в международном журнале "Journal of Applied Physics" по теме квантовой механики',
        date: '2024-01-10',
        status: 'pending'
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Сериков Серик Серикович',
        type: 'teaching',
        title: 'Проведение мастер-класса',
        description: 'Мастер-класс по программированию на Python для студентов младших курсов',
        date: '2024-01-05',
        status: 'active'
      },
      {
        id: '4',
        userId: 'user4',
        userName: 'Жанова Жанар Жановна',
        type: 'general',
        title: 'Участие в конференции',
        description: 'Участие в международной научно-практической конференции по информационным технологиям',
        date: '2024-01-20',
        status: 'pending'
      },
      {
        id: '5',
        userId: 'user5',
        userName: 'Токтаров Токтар Токтарович',
        type: 'additional',
        title: 'Волонтерская деятельность',
        description: 'Организация благотворительного мероприятия для детей из малообеспеченных семей',
        date: '2024-01-12',
        status: 'rejected'
      }
    ];
    setPortfolioItems(mockPortfolioItems);
  }, []);

  if (!canAccess('portfolio', 'manage')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Доступ запрещен</h2>
          <p className="text-gray-600">У вас нет прав для просмотра этой страницы</p>
        </div>
      </div>
    );
  }

  const filteredItems = portfolioItems.filter(item => {
    const matchesSearch = item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'general': return 'Общее';
      case 'publications': return 'Публикации';
      case 'teaching': return 'Преподавание';
      case 'achievements': return 'Достижения';
      case 'additional': return 'Дополнительно';
      default: return type;
    }
  };

  const handleStatusChange = (id: string, newStatus: 'active' | 'pending' | 'rejected') => {
    setPortfolioItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
      setPortfolioItems(prev => prev.filter(item => item.id !== id));
    }
  };

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
            <FileUser size={32} className="text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              Управление портфолио
            </h1>
          </div>
          <p className="text-gray-600">
            Просмотр и управление портфолио всех пользователей
          </p>
        </div>

        {/* Фильтры и поиск */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Поиск
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по имени или названию..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">Все типы</option>
                <option value="general">Общее</option>
                <option value="publications">Публикации</option>
                <option value="teaching">Преподавание</option>
                <option value="achievements">Достижения</option>
                <option value="additional">Дополнительно</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">Все статусы</option>
                <option value="active">Активные</option>
                <option value="pending">На рассмотрении</option>
                <option value="rejected">Отклоненные</option>
              </select>
            </div>
          </div>
        </div>

        {/* Таблица портфолио */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тип
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.userName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {item.userId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getTypeLabel(item.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {item.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.date).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status === 'active' ? 'Активно' : 
                         item.status === 'pending' ? 'На рассмотрении' : 'Отклонено'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          title="Просмотр"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900"
                          onClick={() => handleStatusChange(item.id, 'active')}
                          title="Одобрить"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleStatusChange(item.id, 'rejected')}
                          title="Отклонить"
                        >
                          <XCircle size={16} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(item.id)}
                          title="Удалить"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Статистика */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{filteredItems.length}</div>
            <div className="text-sm text-gray-600">Всего записей</div>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">
              {filteredItems.filter(item => item.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Активных</div>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredItems.filter(item => item.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">На рассмотрении</div>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">
              {filteredItems.filter(item => item.status === 'rejected').length}
            </div>
            <div className="text-sm text-gray-600">Отклоненных</div>
          </div>
        </div>
      </div>
    </div>
  );
}
