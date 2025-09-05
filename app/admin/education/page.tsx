'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { 
  GraduationCap, 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  BarChart3,
  MousePointer,
  Search,
  Save,
  X,
  BookOpen,
  Atom,
  Heart,
  Download,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { educationService } from '@/lib/services/educationService';
import { EducationCard, CardAnalytics, EducationCategory } from '@/lib/types/education';
import { exportEducationClicksToWord } from '@/lib/utils/wordExport';

export default function AdminEducationPage() {
  const { user, canAccess } = useAuth();
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  const [cards, setCards] = useState<EducationCard[]>([]);
  const [analytics, setAnalytics] = useState<CardAnalytics[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<EducationCategory>('education');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<EducationCard | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState('ru');

  useEffect(() => {
    if (!canAccess('education', 'manage')) {
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

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = () => {
    setLoading(true);
    try {
      const allCards = educationService.getAllCards();
      const filteredCards = allCards.filter(card => card.category === selectedCategory);
      setCards(filteredCards);
      
      const filteredAnalytics = educationService.getAnalyticsByCategory(selectedCategory);
      setAnalytics(filteredAnalytics);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = () => {
    setEditingCard({
      id: '',
      title: '',
      description: '',
      image: '',
      href: '',
      ctaLabel: 'Войти',
      category: selectedCategory,
      isActive: true,
      order: cards.length + 1,
      createdAt: '',
      updatedAt: ''
    });
    setShowModal(true);
  };

  const handleEditCard = (card: EducationCard) => {
    setEditingCard({ ...card });
    setShowModal(true);
  };

  const handleSaveCard = () => {
    if (!editingCard) return;

    try {
      if (editingCard.id) {
        // Обновление существующей карточки
        educationService.updateCard(editingCard.id, editingCard);
      } else {
        // Создание новой карточки
        educationService.createCard(editingCard);
      }
      
      loadData();
      setShowModal(false);
      setEditingCard(null);
    } catch (error) {
      console.error('Ошибка сохранения карточки:', error);
      alert('Ошибка при сохранении карточки');
    }
  };

  const handleDeleteCard = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту карточку?')) {
      try {
        educationService.deleteCard(id);
        loadData();
      } catch (error) {
        console.error('Ошибка удаления карточки:', error);
        alert('Ошибка при удалении карточки');
      }
    }
  };

  const handleExportToWord = () => {
    try {
      const clicksData = educationService.getUserClicksData(selectedCategory);
      if (clicksData.length === 0) {
        alert('Нет данных о переходах для экспорта');
        return;
      }
      exportEducationClicksToWord(clicksData, selectedCategory);
    } catch (error) {
      console.error('Ошибка экспорта в Word:', error);
      alert('Ошибка при экспорте данных');
    }
  };

  const getCategoryInfo = (category: EducationCategory) => {
    switch (category) {
      case 'education':
        return {
          title: t('admin.education.education'),
          icon: <GraduationCap size={24} className="text-blue-600" />,
          color: 'from-blue-500 to-indigo-600',
          bgColor: 'from-blue-50 to-indigo-50'
        };
      case 'science':
        return {
          title: t('admin.education.science'),
          icon: <Atom size={24} className="text-green-600" />,
          color: 'from-green-500 to-emerald-600',
          bgColor: 'from-green-50 to-emerald-50'
        };
      case 'upbringing':
        return {
          title: t('admin.education.research'),
          icon: <Heart size={24} className="text-pink-600" />,
          color: 'from-pink-500 to-rose-600',
          bgColor: 'from-pink-50 to-rose-50'
        };
    }
  };

  const filteredCards = cards.filter(card =>
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryInfo = getCategoryInfo(selectedCategory);

  if (!canAccess('education', 'manage')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Доступ запрещен</h2>
          <p className="text-gray-600">У вас нет прав для просмотра этой страницы</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
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
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
                  <GraduationCap size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {t('admin.education.title')}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {t('admin.education.description')}
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
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="flex items-center gap-2 bg-white/80 hover:bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <BarChart3 size={16} />
                {t('admin.education.analytics')}
              </Button>
              <Button
                variant="outline"
                onClick={handleExportToWord}
                className="flex items-center gap-2 bg-white/80 hover:bg-white border-green-200 hover:border-green-300 text-green-700 hover:text-green-900 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Download size={16} />
                {t('admin.education.export')}
              </Button>
              <Button
                onClick={handleCreateCard}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus size={16} />
                {t('admin.education.addCard')}
              </Button>
            </div>
          </div>
        </div>

        {/* Переключатель категорий */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            {(['education', 'science', 'upbringing'] as EducationCategory[]).map((category) => {
              const info = getCategoryInfo(category);
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${info.color} text-white shadow-lg transform scale-105`
                      : 'bg-white/80 hover:bg-white text-gray-700 shadow-sm hover:shadow-md'
                  }`}
                >
                  {info.icon}
                  <span className="font-semibold">{info.title}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {educationService.getCardsByCategory(category).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Фильтры */}
        <Card className={`p-6 mb-8 bg-gradient-to-r ${categoryInfo.bgColor} backdrop-blur-sm border-0 shadow-lg`}>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {t('admin.education.search')} &quot;{categoryInfo.title}&quot;
              </label>
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('admin.education.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{filteredCards.length}</div>
                <div className="text-sm text-gray-600">{t('admin.education.category')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {analytics.reduce((sum, a) => sum + a.totalClicks, 0)}
                </div>
                <div className="text-sm text-gray-600">{t('admin.education.clicks')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {analytics.reduce((sum, a) => sum + a.uniqueUsers, 0)}
                </div>
                <div className="text-sm text-gray-600">Пользователей</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Аналитика */}
        {showAnalytics && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Аналитика переходов - {categoryInfo.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analytics.map((analytics) => (
                <Card key={analytics.cardId} className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{analytics.cardTitle}</h3>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <MousePointer size={20} className="text-purple-600" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Всего кликов:</span>
                      <span className="font-semibold text-purple-600">{analytics.totalClicks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Уникальных пользователей:</span>
                      <span className="font-semibold text-blue-600">{analytics.uniqueUsers}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Топ пользователи:</h4>
                      <div className="space-y-1">
                        {analytics.clicksByUser.slice(0, 3).map((user) => (
                          <div key={user.userId} className="flex justify-between text-xs">
                            <span className="text-gray-600 truncate">{user.userName}</span>
                            <span className="text-purple-600 font-medium">{user.clickCount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Список карточек */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <Card key={card.id} className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <img src={card.image} alt={card.title} className="w-8 h-8 object-contain" />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleEditCard(card)}
                    className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 border-blue-200 hover:border-blue-300 px-3 py-1 text-sm"
                    title={t('admin.education.edit')}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteCard(card.id)}
                    className="text-red-600 hover:text-red-900 hover:bg-red-50 border-red-200 hover:border-red-300 px-3 py-1 text-sm"
                    title={t('admin.education.delete')}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{card.description}</p>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  card.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {card.isActive ? 'Активна' : 'Неактивна'}
                </span>
                <span className="text-xs text-gray-500">Порядок: {card.order}</span>
              </div>
            </Card>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <Card className="p-16 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="p-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl">
              {categoryInfo.icon}
              <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-4">{t('admin.education.noCards')}</h3>
              <p className="text-gray-600 text-lg">{t('admin.education.noCardsDescription')}</p>
            </div>
          </Card>
        )}

        {/* Модальное окно редактирования */}
        {showModal && editingCard && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingCard.id ? 'Редактировать карточку' : 'Создать карточку'}
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="p-3 hover:bg-gray-50 rounded-xl"
                  >
                    <X size={20} />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Название
                    </label>
                    <Input
                      value={editingCard.title}
                      onChange={(e) => setEditingCard({...editingCard, title: e.target.value})}
                      placeholder="Введите название карточки"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Описание
                    </label>
                    <textarea
                      value={editingCard.description}
                      onChange={(e) => setEditingCard({...editingCard, description: e.target.value})}
                      placeholder="Введите описание карточки"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm transition-all duration-200"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      URL изображения
                    </label>
                    <Input
                      value={editingCard.image}
                      onChange={(e) => setEditingCard({...editingCard, image: e.target.value})}
                      placeholder="/image.png"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Ссылка
                    </label>
                    <Input
                      value={editingCard.href}
                      onChange={(e) => setEditingCard({...editingCard, href: e.target.value})}
                      placeholder="https://example.com"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Текст кнопки
                    </label>
                    <Input
                      value={editingCard.ctaLabel}
                      onChange={(e) => setEditingCard({...editingCard, ctaLabel: e.target.value})}
                      placeholder="Войти"
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Порядок
                      </label>
                      <Input
                        type="number"
                        value={editingCard.order}
                        onChange={(e) => setEditingCard({...editingCard, order: parseInt(e.target.value) || 0})}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={editingCard.isActive}
                        onChange={(e) => setEditingCard({...editingCard, isActive: e.target.checked})}
                        className="mr-2"
                      />
                      <label htmlFor="isActive" className="text-sm font-semibold text-gray-800">
                        Активна
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowModal(false)}
                    >
                      Отмена
                    </Button>
                    <Button
                      onClick={handleSaveCard}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                    >
                      <Save size={16} className="mr-2" />
                      Сохранить
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

