'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { FileUser, Search, Edit, Trash2, Eye, ArrowLeft, CheckCircle, XCircle, Download, FileText, Image, File, Users, Filter, Calendar, Award, BookOpen, Briefcase, Activity, X, FileDown, BarChart3, Globe } from 'lucide-react';
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
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItemWithUser[]>([]);
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [selectedItem, setSelectedItem] = useState<PortfolioItemWithUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState('ru');

  useEffect(() => {
    if (!canAccess('portfolio', 'manage')) {
      router.push('/admin');
    }
  }, [user, canAccess, router]);

  // Инициализация языка
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    const initial = savedLocale || i18n.language || 'ru';
    setLocale(initial);
    if (i18n.language !== initial) {
      i18n.changeLanguage(initial);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = initial;
    }
  }, [i18n]);

  // Функция смены языка
  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLocale = e.target.value;
    setLocale(selectedLocale);
    localStorage.setItem('locale', selectedLocale);
    i18n.changeLanguage(selectedLocale);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = selectedLocale;
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="group p-3 hover:bg-white/80 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ArrowLeft size={20} className="text-gray-600 group-hover:text-gray-900 transition-colors" />
              </button>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <FileUser size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {t('admin.portfolio.title')}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {t('admin.portfolio.description')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Селектор языка */}
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-gray-500" />
                <select
                  value={locale}
                  onChange={changeLanguage}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white/80"
                >
                  <option value="ru">🇷🇺 Русский</option>
                  <option value="en">🇺🇸 English</option>
                  <option value="kz">🇰🇿 Қазақша</option>
                </select>
              </div>
              
              <Button
                variant="outline"
                onClick={() => router.push('/admin/portfolio/analytics')}
                className="flex items-center gap-2 bg-white/80 hover:bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <BarChart3 size={16} />
                {t('admin.portfolio.analytics')}
              </Button>
              <Button
                onClick={handleExportPortfolio}
                disabled={!selectedUserId}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileDown size={16} />
                {t('admin.portfolio.export')}
              </Button>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{users.length}</div>
                <div className="text-sm font-medium text-gray-600">Всего пользователей</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FileUser size={24} className="text-white" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{portfolioItems.length}</div>
                <div className="text-sm font-medium text-gray-600">Записей у пользователя</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FileText size={24} className="text-white" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {portfolioItems.filter(item => item.type === 'publications').length}
                </div>
                <div className="text-sm font-medium text-gray-600">Публикации</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BookOpen size={24} className="text-white" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {portfolioItems.filter(item => item.type === 'achievements').length}
                </div>
                <div className="text-sm font-medium text-gray-600">Достижения</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Award size={24} className="text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Выбор пользователя и фильтры */}
        <Card className="p-8 mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Выберите пользователя
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Поиск по записям
                  </label>
                  <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Поиск по названию или описанию..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Тип портфолио
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
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
          <Card className="p-16 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl">
              <FileUser size={80} className="mx-auto mb-6 text-blue-300" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Выберите пользователя</h3>
              <p className="text-gray-600 text-lg">Выберите пользователя из списка выше, чтобы просмотреть его портфолио</p>
            </div>
          </Card>
        ) : (
          <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Тип
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Название
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Дата создания
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Файлы
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                          <FileText size={64} className="mx-auto mb-6 text-gray-300" />
                          <p className="text-xl font-semibold text-gray-700 mb-2">Нет записей портфолио</p>
                          <p className="text-gray-500">У выбранного пользователя пока нет записей в портфолио</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 group">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg group-hover:scale-110 transition-transform duration-200">
                              {getTypeIcon(item.type)}
                            </div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">
                              {getTypeLabel(item.type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-semibold text-gray-900 mb-1">
                            {item.title}
                          </div>
                          <div className="text-sm text-gray-600 truncate max-w-xs">
                            {item.description}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                          {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {item.attachments && item.attachments.length > 0 ? (
                              <>
                                <span className="text-sm font-medium text-gray-700">
                                  {item.attachments.length}
                                </span>
                                <FileText size={16} className="text-blue-500" />
                              </>
                            ) : (
                              <span className="text-sm text-gray-400">Нет файлов</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewItem(item)}
                              className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-all duration-200"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-900 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200"
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                      <FileUser size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Детали портфолио
                      </h2>
                      <p className="text-gray-600 mt-1">Подробная информация о записи</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="p-3 hover:bg-gray-50 rounded-xl transition-all duration-200"
                  >
                    <X size={20} />
                  </Button>
                </div>

                <div className="space-y-8">
                  {/* Информация о пользователе */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Users size={20} className="text-blue-600" />
                      Информация о пользователе
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/80 p-4 rounded-xl">
                        <span className="font-semibold text-gray-700">Имя:</span>
                        <p className="text-gray-900 font-medium mt-1">{selectedItem.userName}</p>
                      </div>
                      <div className="bg-white/80 p-4 rounded-xl">
                        <span className="font-semibold text-gray-700">Email:</span>
                        <p className="text-gray-900 font-medium mt-1">{selectedItem.userEmail}</p>
                      </div>
                      <div className="bg-white/80 p-4 rounded-xl">
                        <span className="font-semibold text-gray-700">Роль:</span>
                        <p className="text-gray-900 font-medium mt-1">{selectedItem.userRole}</p>
                      </div>
                      <div className="bg-white/80 p-4 rounded-xl">
                        <span className="font-semibold text-gray-700">ID:</span>
                        <p className="text-gray-900 font-medium mt-1">{selectedItem.userId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Основная информация */}
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText size={20} className="text-emerald-600" />
                      Основная информация
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/80 p-4 rounded-xl">
                        <span className="font-semibold text-gray-700">Тип:</span>
                        <p className="text-gray-900 font-medium mt-1">{getTypeLabel(selectedItem.type)}</p>
                      </div>
                      <div className="bg-white/80 p-4 rounded-xl">
                        <span className="font-semibold text-gray-700">Название:</span>
                        <p className="text-gray-900 font-medium mt-1">{selectedItem.title}</p>
                      </div>
                      <div className="bg-white/80 p-4 rounded-xl">
                        <span className="font-semibold text-gray-700">Дата создания:</span>
                        <p className="text-gray-900 font-medium mt-1">{new Date(selectedItem.createdAt).toLocaleDateString('ru-RU')}</p>
                      </div>
                      <div className="bg-white/80 p-4 rounded-xl">
                        <span className="font-semibold text-gray-700">Последнее обновление:</span>
                        <p className="text-gray-900 font-medium mt-1">{new Date(selectedItem.updatedAt).toLocaleDateString('ru-RU')}</p>
                      </div>
                    </div>
                    {selectedItem.description && (
                      <div className="mt-6 bg-white/80 p-4 rounded-xl">
                        <span className="font-semibold text-gray-700">Описание:</span>
                        <p className="text-gray-900 mt-2 leading-relaxed">{selectedItem.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Детальная информация в зависимости от типа */}
                  {selectedItem.type === 'general' && selectedItem.metadata && (() => {
                    const meta = selectedItem.metadata as {
                      fullName?: string
                      position?: string
                      department?: string
                      education?: string
                    }
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Детальная информация</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {meta.fullName && (
                            <div><span className="font-medium">ФИО:</span> {meta.fullName}</div>
                          )}
                          {meta.position && (
                            <div><span className="font-medium">Должность:</span> {meta.position}</div>
                          )}
                          {meta.department && (
                            <div><span className="font-medium">Кафедра:</span> {meta.department}</div>
                          )}
                          {meta.education && (
                            <div><span className="font-medium">Образование:</span> {meta.education}</div>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  {/* Файлы */}
                  {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <FileDown size={20} className="text-purple-600" />
                          Прикрепленные файлы
                        </h3>
                        {selectedItem.attachments.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadAllFiles(selectedItem.attachments!)}
                            className="text-purple-600 hover:text-purple-900 hover:bg-purple-50 border-purple-200 hover:border-purple-300 transition-all duration-200"
                          >
                            <Download size={16} />
                            Скачать все
                          </Button>
                        )}
                      </div>
                      <div className="space-y-3">
                        {selectedItem.attachments.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-purple-100 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                                {getFileIcon(file.type)}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{file.name}</div>
                                <div className="text-sm text-gray-600">
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
                                  className="text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50 border-emerald-200 hover:border-emerald-300 transition-all duration-200"
                                >
                                  <Eye size={16} />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadFile(file)}
                                className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-all duration-200"
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

