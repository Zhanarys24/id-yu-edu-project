'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { 
  Monitor, FileText, Calendar, GraduationCap, BookOpen, 
  Users, Settings, Bot, Trophy, FileUser, Shield, Globe
} from 'lucide-react';

export default function AdminPage() {
  const { user, canAccess, isAdmin } = useAuth();
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  const [locale, setLocale] = useState('ru');

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/main/news');
    }
  }, [user, isAdmin, router]);

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

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{t('admin.accessDenied')}</h2>
          <p className="text-gray-600">{t('admin.noAccess')}</p>
        </div>
      </div>
    );
  }

  const adminPanels = [
    {
      id: 'news',
      title: 'Управление новостями',
      description: 'Добавление, изменение и удаление новостей',
      icon: <FileText size={24} />,
      href: '/admin/news',
      requiredPermission: 'news',
      color: 'bg-blue-500'
    },
    {
      id: 'events',
      title: 'Управление мероприятиями',
      description: 'Подтверждение, отмена и контроль событий',
      icon: <Calendar size={24} />,
      href: '/admin/events',
      requiredPermission: 'events',
      color: 'bg-green-500'
    },
    {
      id: 'education',
      title: 'Управление образованием',
      description: 'Управление карточками образования, науки и воспитания',
      icon: <GraduationCap size={24} />,
      href: '/admin/education',
      requiredPermission: 'education',
      color: 'bg-purple-500'
    },
    {
      id: 'eservices',
      title: 'Управление Е-услугами',
      description: 'Добавление и управление карточками Е-услуг',
      icon: <Settings size={24} />,
      href: '/admin/eservices',
      requiredPermission: 'eservices',
      color: 'bg-orange-500'
    },
    {
      id: 'yessenovai',
      title: 'Управление YessenovAI',
      description: 'Контроль и управление YessenovAI',
      icon: <Bot size={24} />,
      href: '/admin/yessenovai',
      requiredPermission: 'yessenovai',
      color: 'bg-indigo-500'
    },
    {
      id: 'gamification',
      title: 'Управление YU-Gamification',
      description: 'Контроль игровых механик и достижений',
      icon: <Trophy size={24} />,
      href: '/admin/gamification',
      requiredPermission: 'gamification',
      color: 'bg-yellow-500'
    },
    {
      id: 'portfolio',
      title: 'Управление портфолио',
      description: 'Просмотр и управление портфолио пользователей',
      icon: <FileUser size={24} />,
      href: '/admin/portfolio',
      requiredPermission: 'portfolio',
      color: 'bg-red-500'
    },
    {
      id: 'users',
      title: 'Управление пользователями',
      description: 'Управление ролями и правами пользователей (только для супер-админа)',
      icon: <Shield size={24} />,
      href: '/admin/users',
      requiredPermission: 'site_settings',
      color: 'bg-gray-700'
    }
  ];

  const accessiblePanels = (user?.role === 'super_admin')
    ? adminPanels
    : adminPanels.filter(panel => canAccess(panel.requiredPermission, 'manage'));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('admin.title')}
              </h1>
              <p className="text-gray-600">
                {t('admin.welcome')}, {user?.name}! {t('admin.selectSection')}
              </p>
            </div>
            
            {/* Селектор языка */}
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-gray-500" />
              <select
                value={locale}
                onChange={changeLanguage}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="ru">🇷🇺 Русский</option>
                <option value="en">🇺🇸 English</option>
                <option value="kz">🇰🇿 Қазақша</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-blue-500" />
            <span className="text-sm text-blue-600 font-medium">
              {t('admin.role')}: {user?.role === 'super_admin' ? t('admin.superAdmin') : 
                     user?.role === 'admin_news' ? t('admin.adminNews') :
                     user?.role === 'admin_events' ? t('admin.adminEvents') :
                     user?.role === 'admin_education' ? t('admin.adminEducation') :
                     user?.role === 'admin_eservices' ? t('admin.adminEservices') :
                     user?.role === 'admin_yessenovai' ? t('admin.adminYessenovai') :
                     user?.role === 'admin_gamification' ? t('admin.adminGamification') :
                     user?.role === 'admin_portfolio' ? t('admin.adminPortfolio') : t('admin.student')}
            </span>
          </div>
        </div>

        {/* Сетка админ панелей */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessiblePanels.map((panel) => (
            <div
              key={panel.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(panel.href)}
            >
              <div className="p-6">
                <div className={`w-12 h-12 ${panel.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                  {panel.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {panel.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {panel.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600 font-medium">
                    Открыть панель
                  </span>
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Информация о правах */}
        {user && (
          <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ваши права доступа
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.permissions.map((permission) => (
                <div key={permission.section} className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 capitalize">
                    {permission.section}: {permission.actions.join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Кнопка возврата */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/main/news')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    </div>
  );
}
