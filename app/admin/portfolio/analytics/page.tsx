'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, BarChart3, Users, FileText, TrendingUp, Calendar, Award, BookOpen, Briefcase, Activity } from 'lucide-react';
import { portfolioService } from '@/lib/services/portfolioService';
import { userService } from '@/lib/services/userService';
import { PortfolioItem } from '@/lib/types/portfolio';
import { RegisteredUser } from '@/lib/types/user';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type PortfolioItemWithUser = PortfolioItem & {
  userName: string;
  userEmail: string;
  userRole: string;
};

type AnalyticsData = {
  totalUsers: number;
  totalItems: number;
  itemsByType: Record<string, number>;
  itemsByUser: Record<string, number>;
  recentActivity: PortfolioItemWithUser[];
  topUsers: Array<{ user: RegisteredUser; itemCount: number }>;
};

export default function PortfolioAnalyticsPage() {
  const { user, canAccess } = useAuth();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canAccess('portfolio', 'manage')) {
      router.push('/admin');
    }
  }, [user, canAccess, router]);

  useEffect(() => {
    const loadAnalytics = () => {
      try {
        const allUsers = userService.getAllUsers();
        const allPortfolioItems: PortfolioItemWithUser[] = [];
        
        allUsers.forEach(user => {
          const userPortfolio = portfolioService.getUserPortfolio(user.id);
          userPortfolio.forEach(item => {
            allPortfolioItems.push({
              ...item,
              userName: user.name,
              userEmail: user.email,
              userRole: user.role
            });
          });
        });

        // Анализ данных
        const itemsByType = allPortfolioItems.reduce((acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const itemsByUser = allPortfolioItems.reduce((acc, item) => {
          acc[item.userId] = (acc[item.userId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const recentActivity = allPortfolioItems
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);

        const topUsers = allUsers
          .map(user => ({
            user,
            itemCount: itemsByUser[user.id] || 0
          }))
          .sort((a, b) => b.itemCount - a.itemCount)
          .slice(0, 10);

        setAnalyticsData({
          totalUsers: allUsers.length,
          totalItems: allPortfolioItems.length,
          itemsByType,
          itemsByUser,
          recentActivity,
          topUsers
        });
        setLoading(false);
      } catch (error) {
        console.error('Ошибка загрузки аналитики:', error);
        setLoading(false);
      }
    };

    loadAnalytics();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка аналитики...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Ошибка загрузки</h2>
          <p className="text-gray-600">Не удалось загрузить данные аналитики</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.push('/admin/portfolio')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <BarChart3 size={32} className="text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              Аналитика портфолио
            </h1>
          </div>
          <p className="text-gray-600">
            Статистика и аналитика по портфолио пользователей
          </p>
        </div>

        {/* Основная статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users size={24} className="text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{analyticsData.totalUsers}</div>
                <div className="text-sm text-gray-600">Всего пользователей</div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText size={24} className="text-green-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{analyticsData.totalItems}</div>
                <div className="text-sm text-gray-600">Всего записей</div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp size={24} className="text-purple-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {analyticsData.totalItems > 0 ? Math.round(analyticsData.totalItems / analyticsData.totalUsers * 10) / 10 : 0}
                </div>
                <div className="text-sm text-gray-600">Среднее на пользователя</div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Calendar size={24} className="text-yellow-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {analyticsData.recentActivity.filter(item => {
                    const itemDate = new Date(item.createdAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return itemDate > weekAgo;
                  }).length}
                </div>
                <div className="text-sm text-gray-600">За последнюю неделю</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Статистика по типам */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Распределение по типам</h3>
            <div className="space-y-3">
              {Object.entries(analyticsData.itemsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(type)}
                    <span className="text-sm font-medium text-gray-700">{getTypeLabel(type)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / analyticsData.totalItems) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Топ пользователей */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Топ пользователей</h3>
            <div className="space-y-3">
              {analyticsData.topUsers.slice(0, 5).map(({ user, itemCount }, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{itemCount}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Последняя активность */}
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Последняя активность</h3>
          <div className="space-y-3">
            {analyticsData.recentActivity.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getTypeIcon(item.type)}
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.userName}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
