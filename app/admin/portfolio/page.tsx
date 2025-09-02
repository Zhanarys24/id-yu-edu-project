'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FileUser, Search, Edit, Trash2, Eye, ArrowLeft, CheckCircle, XCircle, Download, FileText, Image, File, Users, Filter, Calendar, Award, BookOpen, Briefcase, Activity, X, FileDown, BarChart3 } from 'lucide-react';
import { portfolioService } from '@/lib/services/portfolioService';
import { userService } from '@/lib/services/userService';
import { PortfolioItem, GeneralInfo, Publication, TeachingActivity, Achievement, AdditionalActivity, PortfolioFile } from '@/lib/types/portfolio';
import { RegisteredUser } from '@/lib/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { downloadFile, downloadAllFiles, getFileSizeString, formatFileDate, createFilePreviewUrl } from '@/lib/utils/fileUtils';
import { exportPortfolioToWord } from '@/lib/utils/wordExport';

type PortfolioItemWithUser = PortfolioItem & {
  userName: string;
  userEmail: string;
  userRole: string;
};

export default function AdminPortfolioPage() {
  const { user, canAccess } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItemWithUser[]>([]);
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [selectedItem, setSelectedItem] = useState<PortfolioItemWithUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canAccess('portfolio', 'manage')) {
      router.push('/admin');
    }
  }, [user, canAccess, router]);

  // Загружаем пользователей
  useEffect(() => {
    const loadUsers = () => {
      try {
        const allUsers = userService.getAllUsers();
        setUsers(allUsers);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Загружаем портфолио выбранного пользователя
  useEffect(() => {
    if (!selectedUserId) {
      setPortfolioItems([]);
      return;
    }

    const loadUserPortfolio = () => {
      try {
        const selectedUser = users.find(u => u.id === selectedUserId);
        if (!selectedUser) return;

        const userPortfolio = portfolioService.getUserPortfolio(selectedUserId);
        const portfolioItemsWithUser: PortfolioItemWithUser[] = userPortfolio.map(item => ({
          ...item,
          userName: selectedUser.name,
          userEmail: selectedUser.email,
          userRole: selectedUser.role
        }));

        setPortfolioItems(portfolioItemsWithUser);
      } catch (error) {
        console.error('Ошибка загрузки портфолио пользователя:', error);
      }
    };

    loadUserPortfolio();
  }, [selectedUserId, users]);

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
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    
    return matchesSearch && matchesType;
  });

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'general': return <Users size={16} />;
      case 'publications': return <BookOpen size={16} />;
      case 'teaching': return <Briefcase size={16} />;
      case 'achievements': return <Award size={16} />;
      case 'additional': return <Activity size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const handleViewItem = (item: PortfolioItemWithUser) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
      if (portfolioService.deletePortfolioItem(id)) {
      setPortfolioItems(prev => prev.filter(item => item.id !== id));
      }
    }
  };

  const handleDownloadFile = (file: PortfolioFile) => {
    downloadFile(file);
  };

  const handleDownloadAllFiles = (files: PortfolioFile[]) => {
    downloadAllFiles(files);
  };

  const handleExportPortfolio = () => {
    if (!selectedUserId) {
      alert('Сначала выберите пользователя для экспорта');
      return;
    }

    const selectedUser = users.find(u => u.id === selectedUserId);
    if (!selectedUser) return;

    // Экспортируем в Word документ
    exportPortfolioToWord(selectedUser, portfolioItems);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText size={16} className="text-red-500" />;
      case 'image': return <Image size={16} className="text-green-500" />;
      case 'document': return <File size={16} className="text-blue-500" />;
      default: return <File size={16} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка данных...</p>
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
            <FileUser size={32} className="text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              Управление портфолио
            </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/portfolio/analytics')}
                className="flex items-center gap-2"
              >
                <BarChart3 size={16} />
                Аналитика
              </Button>
              <Button
                onClick={handleExportPortfolio}
                disabled={!selectedUserId}
                className="flex items-center gap-2"
              >
                <FileDown size={16} />
                Экспорт в Word
              </Button>
            </div>
          </div>
          <p className="text-gray-600">
            Просмотр и управление портфолио всех пользователей
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileUser size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                <div className="text-sm text-gray-600">Всего пользователей</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText size={20} className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{portfolioItems.length}</div>
                <div className="text-sm text-gray-600">Записей у пользователя</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen size={20} className="text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {portfolioItems.filter(item => item.type === 'publications').length}
                </div>
                <div className="text-sm text-gray-600">Публикации</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award size={20} className="text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {portfolioItems.filter(item => item.type === 'achievements').length}
                </div>
                <div className="text-sm text-gray-600">Достижения</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Выбор пользователя */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Выберите пользователя
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Выберите пользователя для просмотра портфолио</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email}) - {user.role}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedUserId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Поиск по записям
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                  type="text"
                      placeholder="Поиск по названию или описанию..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип портфолио
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
            </div>
            )}
          </div>
        </Card>

        {/* Таблица портфолио */}
        {!selectedUserId ? (
          <Card className="p-12 text-center">
            <FileUser size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Выберите пользователя</h3>
            <p className="text-gray-500">Выберите пользователя из списка выше, чтобы просмотреть его портфолио</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тип
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата создания
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Файлы
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Нет записей портфолио</p>
                        <p className="text-sm">У выбранного пользователя пока нет записей в портфолио</p>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getTypeLabel(item.type)}
                      </span>
                          </div>
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
                          {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {item.attachments && item.attachments.length > 0 ? (
                              <>
                                <span className="text-sm text-gray-600">
                                  {item.attachments.length}
                      </span>
                                <FileText size={16} className="text-gray-400" />
                              </>
                            ) : (
                              <span className="text-sm text-gray-400">Нет файлов</span>
                            )}
                          </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewItem(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye size={16} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                            </Button>
                      </div>
                    </td>
                  </tr>
                    ))
                  )}
              </tbody>
            </table>
          </div>
          </Card>
        )}

        {/* Модальное окно для просмотра деталей */}
        {showModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Детали портфолио
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    <X size={16} />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Информация о пользователе */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Информация о пользователе</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Имя:</span> {selectedItem.userName}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {selectedItem.userEmail}
                      </div>
                      <div>
                        <span className="font-medium">Роль:</span> {selectedItem.userRole}
                      </div>
                      <div>
                        <span className="font-medium">ID:</span> {selectedItem.userId}
                      </div>
                    </div>
                  </div>

                  {/* Основная информация */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Основная информация</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Тип:</span> {getTypeLabel(selectedItem.type)}
                      </div>
                      <div>
                        <span className="font-medium">Название:</span> {selectedItem.title}
                      </div>
                      <div>
                        <span className="font-medium">Дата создания:</span> {new Date(selectedItem.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                      <div>
                        <span className="font-medium">Последнее обновление:</span> {new Date(selectedItem.updatedAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    {selectedItem.description && (
                      <div className="mt-4">
                        <span className="font-medium">Описание:</span>
                        <p className="text-gray-600 mt-1">{selectedItem.description}</p>
                      </div>
                    )}
        </div>

                  {/* Детальная информация в зависимости от типа */}
                  {selectedItem.type === 'general' && selectedItem.metadata && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Детальная информация</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedItem.metadata.fullName && (
                          <div><span className="font-medium">ФИО:</span> {selectedItem.metadata.fullName}</div>
                        )}
                        {selectedItem.metadata.position && (
                          <div><span className="font-medium">Должность:</span> {selectedItem.metadata.position}</div>
                        )}
                        {selectedItem.metadata.department && (
                          <div><span className="font-medium">Кафедра:</span> {selectedItem.metadata.department}</div>
                        )}
                        {selectedItem.metadata.education && (
                          <div><span className="font-medium">Образование:</span> {selectedItem.metadata.education}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Файлы */}
                  {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">Прикрепленные файлы</h3>
                        {selectedItem.attachments.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadAllFiles(selectedItem.attachments!)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Download size={16} />
                            Скачать все
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {selectedItem.attachments.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              {getFileIcon(file.type)}
                              <div>
                                <div className="font-medium text-gray-900">{file.name}</div>
                                <div className="text-sm text-gray-500">
                                  {getFileSizeString(file.size)} • {formatFileDate(file.uploadedAt)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {createFilePreviewUrl(file) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(file.url, '_blank')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <Eye size={16} />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadFile(file)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Download size={16} />
                              </Button>
                            </div>
          </div>
                        ))}
            </div>
          </div>
                  )}
            </div>
          </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

