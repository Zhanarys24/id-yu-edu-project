'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { 
  BarChart3, TrendingUp, Users, Clock, Download, Calendar,
  ArrowLeft, RefreshCw, FileSpreadsheet, PieChart, Activity,
  CheckCircle, XCircle, AlertTriangle, Award, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Типы для аналитики
type AnalyticsData = {
  attendance: {
    totalRecords: number;
    presentToday: number;
    lateToday: number;
    absentToday: number;
    averageWorkHours: number;
    topLateUsers: Array<{
      name: string;
      lateCount: number;
    }>;
  };
  students: {
    totalStudents: number;
    presentToday: number;
    lateToday: number;
    absentToday: number;
    averageAttendance: number;
    topActiveStudents: Array<{
      name: string;
      attendanceRate: number;
    }>;
  };
  portfolio: {
    totalUsers: number;
    totalItems: number;
    itemsByType: Record<string, number>;
    recentActivity: number;
    topContributors: Array<{
      name: string;
      itemsCount: number;
    }>;
  };
  system: {
    totalAccessPoints: number;
    activeAccessPoints: number;
    totalAccessRecords: number;
    systemUptime: string;
    lastBackup: string;
  };
};

type ChartData = {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }>;
};

export default function AnalyticsPage() {
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation('common');
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/main/news');
    }
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = () => {
    setIsLoading(true);
    
    // Моковые данные аналитики
    const mockData: AnalyticsData = {
      attendance: {
        totalRecords: 1247,
        presentToday: 38,
        lateToday: 3,
        absentToday: 4,
        averageWorkHours: 7.8,
        topLateUsers: [
          { name: 'Асель Толеуова', lateCount: 5 },
          { name: 'Данияр Касымов', lateCount: 3 },
          { name: 'Жанар Сейтжанова', lateCount: 2 }
        ]
      },
      students: {
        totalStudents: 1567,
        presentToday: 1245,
        lateToday: 45,
        absentToday: 277,
        averageAttendance: 79.4,
        topActiveStudents: [
          { name: 'Алмас Жумабеков', attendanceRate: 98.5 },
          { name: 'Айгерим Нурланова', attendanceRate: 96.2 },
          { name: 'Данияр Касымов', attendanceRate: 94.8 }
        ]
      },
      portfolio: {
        totalUsers: 45,
        totalItems: 234,
        itemsByType: {
          general: 45,
          publication: 67,
          teaching: 89,
          achievement: 23,
          additional: 10
        },
        recentActivity: 12,
        topContributors: [
          { name: 'Абыков Мирас', itemsCount: 15 },
          { name: 'Асель Толеуова', itemsCount: 12 },
          { name: 'Данияр Касымов', itemsCount: 10 }
        ]
      },
      system: {
        totalAccessPoints: 5,
        activeAccessPoints: 4,
        totalAccessRecords: 2156,
        systemUptime: '99.8%',
        lastBackup: '2024-01-25 02:00:00'
      }
    };

    setTimeout(() => {
      setAnalyticsData(mockData);
      setIsLoading(false);
    }, 1000);
  };

  const exportAnalytics = () => {
    if (!analyticsData) return;
    
    const headers = ['Метрика', 'Значение', 'Описание'];
    const rows = [
      ['Всего сотрудников', analyticsData.attendance?.presentToday + analyticsData.attendance?.absentToday || 0, 'Количество сотрудников в системе'],
      ['На работе сегодня', analyticsData.attendance?.presentToday || 0, 'Сотрудники на рабочем месте'],
      ['Опозданий сегодня', analyticsData.attendance?.lateToday || 0, 'Количество опозданий сотрудников'],
      ['Всего студентов', analyticsData.students?.totalStudents || 0, 'Общее количество студентов'],
      ['Присутствуют сегодня', analyticsData.students?.presentToday || 0, 'Студенты на занятиях'],
      ['Средняя посещаемость', `${analyticsData.students?.averageAttendance || 0}%`, 'Процент посещаемости студентов'],
      ['Записей портфолио', analyticsData.portfolio?.totalItems || 0, 'Общее количество записей в портфолио'],
      ['Записей СКУД', analyticsData.system?.totalAccessRecords || 0, 'Общее количество записей системы контроля доступа'],
      ['Время работы системы', analyticsData.system?.systemUptime || '0%', 'Процент времени работы системы']
    ];
    
    const csvData = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    downloadCSV(csvData, `analytics_report_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
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

  const getAttendanceChartData = (): ChartData => {
    if (!analyticsData) return { labels: [], datasets: [] };
    
    return {
      labels: ['Присутствуют', 'Опоздали', 'Отсутствуют'],
      datasets: [{
        label: 'Посещаемость сегодня',
        data: [
          analyticsData.attendance.presentToday,
          analyticsData.attendance.lateToday,
          analyticsData.attendance.absentToday
        ],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderColor: ['#059669', '#D97706', '#DC2626'],
        borderWidth: 2
      }]
    };
  };

  const getPortfolioChartData = (): ChartData => {
    if (!analyticsData) return { labels: [], datasets: [] };
    
    const { itemsByType } = analyticsData.portfolio;
    return {
      labels: Object.keys(itemsByType).map(key => {
        switch (key) {
          case 'general': return 'Общая информация';
          case 'publication': return 'Публикации';
          case 'teaching': return 'Преподавание';
          case 'achievement': return 'Достижения';
          case 'additional': return 'Дополнительно';
          default: return key;
        }
      }),
      datasets: [{
        label: 'Записи портфолио',
        data: Object.values(itemsByType),
        backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'],
        borderColor: ['#2563EB', '#059669', '#7C3AED', '#D97706', '#DC2626'],
        borderWidth: 2
      }]
    };
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка аналитики...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Аналитика</h1>
              <p className="text-gray-600">Общая статистика и аналитические отчеты</p>
            </div>
          </div>

          {/* Период и экспорт */}
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Сегодня</option>
                <option value="week">Эта неделя</option>
                <option value="month">Этот месяц</option>
                <option value="quarter">Этот квартал</option>
                <option value="year">Этот год</option>
              </select>
              <Button onClick={loadAnalyticsData} variant="outline">
                <RefreshCw size={16} className="mr-2" />
                Обновить
              </Button>
            </div>
            <Button onClick={exportAnalytics} className="bg-green-600 hover:bg-green-700">
              <FileSpreadsheet size={16} className="mr-2" />
              Экспорт отчета
            </Button>
          </div>
        </div>

        {analyticsData && (
          <>
            {/* Общая статистика */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Всего сотрудников</p>
                    <p className="text-2xl font-bold">{analyticsData.attendance.presentToday + analyticsData.attendance.absentToday}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <BookOpen className="w-8 h-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Всего студентов</p>
                    <p className="text-2xl font-bold">{analyticsData.students.totalStudents}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Activity className="w-8 h-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Записей портфолио</p>
                    <p className="text-2xl font-bold">{analyticsData.portfolio.totalItems}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-orange-500" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Записей СКУД</p>
                    <p className="text-2xl font-bold">{analyticsData.system.totalAccessRecords}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Посещаемость сотрудников */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Посещаемость сотрудников</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">На работе</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {analyticsData.attendance.presentToday}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                      <span className="text-sm text-gray-600">Опоздали</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">
                      {analyticsData.attendance.lateToday}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-sm text-gray-600">Отсутствуют</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      {analyticsData.attendance.absentToday}
                    </span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Среднее время работы</span>
                      <span className="text-lg font-bold text-blue-600">
                        {analyticsData.attendance.averageWorkHours} ч
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Топ опоздальщиков</h3>
                <div className="space-y-3">
                  {analyticsData.attendance.topLateUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-900">{user.name}</span>
                      </div>
                      <span className="text-sm font-bold text-red-600">
                        {user.lateCount} раз
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Посещаемость студентов */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Посещаемость студентов</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">Присутствуют</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {analyticsData.students.presentToday}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                      <span className="text-sm text-gray-600">Опоздали</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">
                      {analyticsData.students.lateToday}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-sm text-gray-600">Отсутствуют</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      {analyticsData.students.absentToday}
                    </span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Средняя посещаемость</span>
                      <span className="text-lg font-bold text-blue-600">
                        {analyticsData.students.averageAttendance}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Самые активные студенты</h3>
                <div className="space-y-3">
                  {analyticsData.students.topActiveStudents.map((student, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-900">{student.name}</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        {student.attendanceRate}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Портфолио */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Статистика портфолио</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Всего пользователей</span>
                    <span className="text-lg font-bold text-blue-600">
                      {analyticsData.portfolio.totalUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Всего записей</span>
                    <span className="text-lg font-bold text-green-600">
                      {analyticsData.portfolio.totalItems}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Недавняя активность</span>
                    <span className="text-lg font-bold text-purple-600">
                      {analyticsData.portfolio.recentActivity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Топ контрибьюторы</h3>
                <div className="space-y-3">
                  {analyticsData.portfolio.topContributors.map((contributor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-900">{contributor.name}</span>
                      </div>
                      <span className="text-sm font-bold text-purple-600">
                        {contributor.itemsCount} записей
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Система */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Состояние системы</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Activity size={24} />
                  </div>
                  <p className="text-sm text-gray-600">Точек доступа</p>
                  <p className="text-lg font-bold text-blue-600">
                    {analyticsData.system.activeAccessPoints}/{analyticsData.system.totalAccessPoints}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <TrendingUp size={24} />
                  </div>
                  <p className="text-sm text-gray-600">Время работы</p>
                  <p className="text-lg font-bold text-green-600">
                    {analyticsData.system.systemUptime}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock size={24} />
                  </div>
                  <p className="text-sm text-gray-600">Записей СКУД</p>
                  <p className="text-lg font-bold text-purple-600">
                    {analyticsData.system.totalAccessRecords}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Calendar size={24} />
                  </div>
                  <p className="text-sm text-gray-600">Последний бэкап</p>
                  <p className="text-sm font-bold text-orange-600">
                    {new Date(analyticsData.system.lastBackup).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
