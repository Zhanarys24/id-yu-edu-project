export interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  category: NewsCategory;
  categoryKey: string;
  image: string;
  link: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type NewsCategory = 'rating' | 'international' | 'science' | 'management' | 'cooperation' | 'opening' | 'achievements' | 'olympiad';

export interface NewsClick {
  id: string;
  newsId: string;
  userId: string;
  userEmail: string;
  userName: string;
  clickedAt: string;
  userAgent: string;
  ipAddress: string;
}

export interface NewsAnalytics {
  newsId: string;
  newsTitle: string;
  totalClicks: number;
  uniqueUsers: number;
  clicksByUser: {
    userId: string;
    userName: string;
    userEmail: string;
    clickCount: number;
    lastClick: string;
  }[];
  clicksByDate: {
    date: string;
    clicks: number;
  }[];
}

export interface UserNewsClickData {
  userId: string;
  userName: string;
  userEmail: string;
  newsId: string;
  newsTitle: string;
  category: NewsCategory;
  clickedAt: string;
  clickCount: number;
}

export const NEWS_CATEGORIES: Record<NewsCategory, string> = {
  rating: 'Рейтинги',
  international: 'Международное сотрудничество',
  science: 'Наука',
  management: 'Управление',
  cooperation: 'Сотрудничество',
  opening: 'Открытие',
  achievements: 'Достижения',
  olympiad: 'Олимпиада'
};
