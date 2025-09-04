export type NewsStatus = 'draft' | 'published' | 'archived' | 'scheduled';

export type NewsCategory = {
  id: string;
  name: string;
  nameEn: string;
  nameKz: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type NewsTag = {
  id: string;
  name: string;
  nameEn: string;
  nameKz: string;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type NewsItem = {
  id: string;
  title: string;
  titleEn: string;
  titleKz: string;
  description: string;
  descriptionEn: string;
  descriptionKz: string;
  content: string;
  contentEn: string;
  contentKz: string;
  excerpt: string;
  excerptEn: string;
  excerptKz: string;
  image: string;
  imageAlt?: string;
  categoryId: string;
  category?: NewsCategory;
  tags: string[];
  tagObjects?: NewsTag[];
  status: NewsStatus;
  publishedAt?: string;
  scheduledAt?: string;
  archivedAt?: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  viewCount: number;
  isFeatured: boolean;
  isBreaking: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: string;
  updatedAt: string;
};

export type NewsClickData = {
  id: string;
  newsId: string;
  userId: string;
  userName: string;
  userEmail: string;
  clickedAt: string;
  userAgent?: string;
  ipAddress?: string;
};

export type NewsAnalytics = {
  totalNews: number;
  publishedNews: number;
  scheduledNews: number;
  archivedNews: number;
  totalViews: number;
  totalClicks: number;
  uniqueReaders: number;
  topNews: Array<{
    news: NewsItem;
    viewCount: number;
    clickCount: number;
  }>;
  topCategories: Array<{
    category: NewsCategory;
    newsCount: number;
    viewCount: number;
  }>;
  topTags: Array<{
    tag: NewsTag;
    newsCount: number;
  }>;
  recentClicks: NewsClickData[];
  viewsByDate: Array<{
    date: string;
    views: number;
    clicks: number;
  }>;
};

export type NewsDatabase = {
  news: NewsItem[];
  categories: NewsCategory[];
  tags: NewsTag[];
  clicks: NewsClickData[];
  nextNewsId: number;
  nextCategoryId: number;
  nextTagId: number;
  nextClickId: number;
};

// Начальные категории новостей
export const INITIAL_NEWS_CATEGORIES: NewsCategory[] = [
  {
    id: '1',
    name: 'Рейтинги',
    nameEn: 'Rankings',
    nameKz: 'Рейтингтер',
    description: 'Новости о рейтингах университета',
    color: '#3B82F6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Международное сотрудничество',
    nameEn: 'International Cooperation',
    nameKz: 'Халықаралық ынтымақтастық',
    description: 'Международные проекты и партнерства',
    color: '#10B981',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Наука',
    nameEn: 'Science',
    nameKz: 'Ғылым',
    description: 'Научные достижения и исследования',
    color: '#8B5CF6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Менеджмент',
    nameEn: 'Management',
    nameKz: 'Менеджмент',
    description: 'Управленческие решения и инициативы',
    color: '#F59E0B',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Сотрудничество',
    nameEn: 'Cooperation',
    nameKz: 'Ынтымақтастық',
    description: 'Партнерские отношения и совместные проекты',
    color: '#EF4444',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Открытия',
    nameEn: 'Openings',
    nameKz: 'Ашылулар',
    description: 'Открытие новых объектов и программ',
    color: '#06B6D4',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '7',
    name: 'Достижения',
    nameEn: 'Achievements',
    nameKz: 'Жетістіктер',
    description: 'Достижения студентов и преподавателей',
    color: '#84CC16',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '8',
    name: 'Олимпиады',
    nameEn: 'Olympiads',
    nameKz: 'Олимпиадалар',
    description: 'Олимпиады и конкурсы',
    color: '#F97316',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Начальные теги
export const INITIAL_NEWS_TAGS: NewsTag[] = [
  {
    id: '1',
    name: 'Важное',
    nameEn: 'Important',
    nameKz: 'Маңызды',
    color: '#EF4444',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Срочное',
    nameEn: 'Urgent',
    nameKz: 'Шұғыл',
    color: '#F59E0B',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Образование',
    nameEn: 'Education',
    nameKz: 'Білім беру',
    color: '#3B82F6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Исследования',
    nameEn: 'Research',
    nameKz: 'Зерттеулер',
    color: '#8B5CF6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Студенты',
    nameEn: 'Students',
    nameKz: 'Студенттер',
    color: '#10B981',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Преподаватели',
    nameEn: 'Faculty',
    nameKz: 'Оқытушылар',
    color: '#06B6D4',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];