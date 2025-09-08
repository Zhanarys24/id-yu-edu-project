'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { 
  FileUser, Download, Search, Filter, Calendar, Users,
  ArrowLeft, RefreshCw, Eye, MoreVertical, FileSpreadsheet,
  BarChart3, TrendingUp, Award, BookOpen, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Типы для портфолио
type PortfolioItem = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  type: 'general' | 'publication' | 'teaching' | 'achievement' | 'additional';
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  attachments?: PortfolioFile[];
};

type PortfolioFile = {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'document';
  size: number;
  url: string;
  uploadedAt: string;
};

type PortfolioStats = {
  totalUsers: number;
  totalItems: number;
  itemsByType: Record<string, number>;
  recentActivity: number;
  topUsers: Array<{
    name: string;
    itemsCount: number;
  }>;
};

export default function PortfolioManagementPage() {
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation('common');
  const router = useRouter();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [showItemDetails, setShowItemDetails] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/main/news');
    }
    loadPortfolioData();
  }, []);

  const loadPortfolioData = () => {
    // Моковые данные портфолио
    const mockItems: PortfolioItem[] = [
      {
        id: '1',
        userId: '1',
        userName: 'Абыков Мирас',
        userEmail: 'aidar@yu.edu.kz',
        userRole: 'super_admin',
        type: 'general',
        title: 'Общая информация',
        description: 'Основные данные о сотруднике',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        attachments: [
          {
            id: '1',
            name: 'resume.pdf',
            type: 'pdf',
            size: 1024000,
            url: '/files/resume.pdf',
            uploadedAt: '2024-01-15T10:00:00Z'
          }
        ]
      },
      {
        id: '2',
        userId: '1',
        userName: 'Абыков Мирас',
        userEmail: 'aidar@yu.edu.kz',
        userRole: 'super_admin',
        type: 'publication',
        title: 'Исследование в области ИИ',
        description: 'Научная статья о применении машинного обучения',
        createdAt: '2024-01-20T14:30:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
        attachments: [
          {
            id: '2',
            name: 'ai_research.pdf',
            type: 'pdf',
            size: 2048000,
            url: '/files/ai_research.pdf',
            uploadedAt: '2024-01-20T14:30:00Z'
          }
        ]
      },
      {
        id: '3',
        userId: '2',
        userName: 'Асель Толеуова',
        userEmail: 'asel@yu.edu.kz',
        userRole: 'admin_news',
        type: 'teaching',
        title: 'Курс по маркетингу',
        description: 'Преподавательская деятельность',
        createdAt: '2024-01-18T09:15:00Z',
        updatedAt: '2024-01-18T09:15:00Z'
      },
      {
        id: '4',
        userId: '3',
        userName: 'Данияр Касымов',
        userEmail: 'daniyar@yu.edu.kz',
        userRole: 'admin_portfolio',
        type: 'achievement',
        title: 'Сертификат PMP',
        description: 'Профессиональный сертификат по управлению проектами',
        createdAt: '2024-01-22T16:45:00Z',
        updatedAt: '2024-01-22T16:45:00Z',
        attachments: [
          {
            id: '3',
            name: 'pmp_certificate.pdf',
            type: 'pdf',
            size: 512000,
            url: '/files/pmp_certificate.pdf',
            uploadedAt: '2024-01-22T16:45:00Z'
          }
        ]
      },
      {
        id: '5',
        userId: '4',
        userName: 'Жанар Сейтжанова',
        userEmail: 'zhanar@yu.edu.kz',
        userRole: 'admin_events',
        type: 'additional',
        title: 'Волонтерство в детском доме',
        description: 'Дополнительная общественная деятельность',
        createdAt: '2024-01-25T11:20:00Z',
        updatedAt: '2024-01-25T11:20:00Z'
      }
    ];

    setPortfolioItems(mockItems);

    // Моковая статистика
    const mockStats: PortfolioStats = {
      totalUsers: 4,
      totalItems: 5,
      itemsByType: {
        general: 1,
        publication: 1,
        teaching: 1,
        achievement: 1,
        additional: 1
      },
      recentActivity: 3,
      topUsers: [
        { name: 'Абыков Мирас', itemsCount: 2 },
        { name: 'Асель Толеуова', itemsCount: 1 },
        { name: 'Данияр Касымов', itemsCount: 1 },
        { name: 'Жанар Сейтжанова', itemsCount: 1 }
      ]
    };

    setStats(mockStats);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'general':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'publication':
        return <BookOpen className="w-5 h-5 text-green-500" />;
      case 'teaching':
        return <Award className="w-5 h-5 text-purple-500" />;
      case 'achievement':
        return <Award className="w-5 h-5 text-yellow-500" />;
      case 'additional':
        return <BarChart3 className="w-5 h-5 text-orange-500" />;
      default:
        return <FileUser className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'general':
        return 'Общая информация';
      case 'publication':
        return 'Публикации';
      case 'teaching':
        return 'Преподавание';
      case 'achievement':
        return 'Достижения';
      case 'additional':
        return 'Дополнительно';
      default:
        return 'Неизвестно';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'general':
        return 'bg-blue-100 text-blue-800';
      case 'publication':
        return 'bg-green-100 text-green-800';
      case 'teaching':
        return 'bg-purple-100 text-purple-800';
      case 'achievement':
        return 'bg-yellow-100 text-yellow-800';
      case 'additional':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredItems = portfolioItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesUser = filterUser === 'all' || item.userId === filterUser;
    return matchesSearch && matchesType && matchesUser;
  });

  const exportToExcel = () => {
    const headers = ['Пользователь', 'Email', 'Роль', 'Тип записи', 'Название', 'Описание', 'Дата создания', 'Дата обновления', 'Количество файлов'];
    const csvData = [
      headers.join(','),
      ...portfolioItems.map(item => [
        item.userName,
        item.userEmail,
        item.userRole,
        getTypeText(item.type),
        item.title,
        item.description,
        new Date(item.createdAt).toLocaleDateString(),
        new Date(item.updatedAt).toLocaleDateString(),
        item.attachments ? item.attachments.length.toString() : '0'
      ].join(','))
    ].join('\n');
    
    downloadCSV(csvData, `portfolio_data_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportUserPortfolio = (userId: string) => {
    const userItems = portfolioItems.filter(item => item.userId === userId);
    const user = userItems[0];
    
    if (!user) return;
    
    const headers = ['Пользователь', 'Email', 'Роль', 'Общее количество записей', 'Последняя активность'];
    const summaryRow = [
      user.userName,
      user.userEmail,
      user.userRole,
      userItems.length.toString(),
      new Date(Math.max(...userItems.map(item => new Date(item.updatedAt).getTime()))).toLocaleDateString()
    ];
    
    const itemHeaders = ['Тип', 'Название', 'Описание', 'Дата создания', 'Дата обновления', 'Количество файлов'];
    const itemRows = userItems.map(item => [
      getTypeText(item.type),
      item.title,
      item.description,
      new Date(item.createdAt).toLocaleDateString(),
      new Date(item.updatedAt).toLocaleDateString(),
      item.attachments ? item.attachments.length.toString() : '0'
    ]);
    
    const csvData = [
      headers.join(','),
      summaryRow.join(','),
      '',
      'Записи портфолио:',
      itemHeaders.join(','),
      ...itemRows.map(row => row.join(','))
    ].join('\n');
    
    downloadCSV(csvData, `portfolio_${user.userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const downloadCSV = (csvData: string, filename: string) => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isAdmin()) {
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
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/admin/service-analysis')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Управление портфолио</h1>
              <p className="text-gray-600">Просмотр и управление портфолио всех пользователей</p>
            </div>
          </div>

          {/* Статистика */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Всего пользователей</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <FileUser className="w-8 h-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Всего записей</p>
                    <p className="text-2xl font-bold">{stats.totalItems}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Недавняя активность</p>
                    <p className="text-2xl font-bold">{stats.recentActivity}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <BarChart3 className="w-8 h-8 text-orange-500" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Среднее на пользователя</p>
                    <p className="text-2xl font-bold">
                      {Math.round(stats.totalItems / stats.totalUsers)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <Award className="w-8 h-8 text-yellow-500" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Топ пользователь</p>
                    <p className="text-sm font-bold">{stats.topUsers[0]?.name}</p>
                    <p className="text-xs text-gray-500">{stats.topUsers[0]?.itemsCount} записей</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Фильтры и поиск */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Поиск по названию, описанию или пользователю..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все типы</option>
                <option value="general">Общая информация</option>
                <option value="publication">Публикации</option>
                <option value="teaching">Преподавание</option>
                <option value="achievement">Достижения</option>
                <option value="additional">Дополнительно</option>
              </select>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все пользователи</option>
                {Array.from(new Set(portfolioItems.map(item => item.userId))).map(userId => {
                  const user = portfolioItems.find(item => item.userId === userId);
                  return (
                    <option key={userId} value={userId}>
                      {user?.userName}
                    </option>
                  );
                })}
              </select>
              <Button onClick={loadPortfolioData} variant="outline">
                <RefreshCw size={16} className="mr-2" />
                Обновить
              </Button>
              <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
                <FileSpreadsheet size={16} className="mr-2" />
                Экспорт Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Таблица портфолио */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                    Описание
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Файлы
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Обновлено
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
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                            {item.userName.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.userEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(item.type)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                          {getTypeText(item.type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.attachments ? item.attachments.length : 0} файлов
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => exportUserPortfolio(item.userId)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Экспорт портфолио пользователя"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowItemDetails(true);
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title="Подробная информация"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Модальное окно с деталями записи */}
        {showItemDetails && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Детали записи портфолио</h3>
                <button
                  onClick={() => setShowItemDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Пользователь</label>
                    <p className="text-gray-900">{selectedItem.userName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedItem.userEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Роль</label>
                    <p className="text-gray-900">{selectedItem.userRole}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Тип</label>
                    <p className="text-gray-900">{getTypeText(selectedItem.type)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Название</label>
                  <p className="text-gray-900">{selectedItem.title}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Описание</label>
                  <p className="text-gray-900">{selectedItem.description}</p>
                </div>

                {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Прикрепленные файлы</label>
                    <div className="mt-2 space-y-2">
                      {selectedItem.attachments.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileUser size={16} className="text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({Math.round(file.size / 1024)} KB)
                            </span>
                          </div>
                          <button
                            onClick={() => window.open(file.url, '_blank')}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Скачать
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  onClick={() => exportUserPortfolio(selectedItem.userId)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FileSpreadsheet size={16} className="mr-2" />
                  Экспорт в Excel
                </Button>
                <Button
                  onClick={() => setShowItemDetails(false)}
                  variant="outline"
                >
                  Закрыть
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
