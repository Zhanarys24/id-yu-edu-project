'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { 
  Monitor, FileUser, Users, GraduationCap, Clock, 
  BarChart3, Download, Settings, Globe, Shield
} from 'lucide-react';

export default function ServiceAnalysisPage() {
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

  const serviceAnalysisPanels = [
    {
      id: 'portfolio',
      title: 'Управление портфолио',
      description: 'Просмотр и управление портфолио всех пользователей',
      icon: <FileUser size={24} />,
      href: '/admin/service-analysis/portfolio',
      color: 'bg-blue-500',
      stats: '1,234 записи'
    },
    {
      id: 'employees',
      title: 'Сотрудники',
      description: 'Учет рабочего времени, контроль опозданий, анализ посещаемости',
      icon: <Users size={24} />,
      href: '/admin/service-analysis/employees',
      color: 'bg-green-500',
      stats: '45 сотрудников'
    },
    {
      id: 'students',
      title: 'Студенты',
      description: 'Учет посещаемости студентов, анализ активности',
      icon: <GraduationCap size={24} />,
      href: '/admin/service-analysis/students',
      color: 'bg-purple-500',
      stats: '1,567 студентов'
    },
    {
      id: 'attendance',
      title: 'СКУД система',
      description: 'Система контроля и управления доступом, учет времени входа/выхода',
      icon: <Clock size={24} />,
      href: '/admin/service-analysis/attendance',
      color: 'bg-orange-500',
      stats: '2,012 записей сегодня'
    },
    {
      id: 'analytics',
      title: 'Аналитика',
      description: 'Общая статистика, отчеты, экспорт данных',
      icon: <BarChart3 size={24} />,
      href: '/admin/service-analysis/analytics',
      color: 'bg-indigo-500',
      stats: '15 отчетов'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Анализ сервиса
              </h1>
              <p className="text-gray-600">
                Система учета рабочего времени, управление портфолио и аналитика
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

        {/* Статистические карточки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего сотрудников</p>
                <p className="text-2xl font-bold text-gray-900">45</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <GraduationCap size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего студентов</p>
                <p className="text-2xl font-bold text-gray-900">1,567</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <Clock size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">На работе сейчас</p>
                <p className="text-2xl font-bold text-gray-900">38</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <BarChart3 size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Опозданий сегодня</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Сетка панелей анализа сервиса */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceAnalysisPanels.map((panel) => (
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
                    Открыть раздел
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {panel.stats}
                    </span>
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Кнопка возврата */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/admin')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Вернуться в админ-панель
          </button>
        </div>
      </div>
    </div>
  );
}
