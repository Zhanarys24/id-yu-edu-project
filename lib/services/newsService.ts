import { NewsItem, NewsClick, NewsAnalytics, UserNewsClickData, NewsCategory, NEWS_CATEGORIES } from '@/lib/types/news';

class NewsService {
  private readonly NEWS_KEY = 'news_items';
  private readonly CLICKS_KEY = 'news_clicks';

  // Управление новостями
  getAllNews(): NewsItem[] {
    try {
      const news = localStorage.getItem(this.NEWS_KEY);
      return news ? JSON.parse(news) : this.getInitialNews();
    } catch (error) {
      console.error('Ошибка загрузки новостей:', error);
      return this.getInitialNews();
    }
  }

  getNewsByCategory(category: NewsCategory): NewsItem[] {
    return this.getAllNews().filter(news => news.category === category);
  }

  getNewsById(id: string): NewsItem | null {
    const news = this.getAllNews();
    return news.find(item => item.id === id) || null;
  }

  getActiveNews(): NewsItem[] {
    return this.getAllNews().filter(news => news.isActive).sort((a, b) => a.order - b.order);
  }

  createNews(news: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>): NewsItem {
    const allNews = this.getAllNews();
    const newNews: NewsItem = {
      ...news,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    allNews.push(newNews);
    this.saveNews(allNews);
    return newNews;
  }

  updateNews(id: string, updates: Partial<Omit<NewsItem, 'id' | 'createdAt'>>): boolean {
    const allNews = this.getAllNews();
    const index = allNews.findIndex(news => news.id === id);
    
    if (index === -1) return false;
    
    allNews[index] = {
      ...allNews[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveNews(allNews);
    return true;
  }

  deleteNews(id: string): boolean {
    const allNews = this.getAllNews();
    const filteredNews = allNews.filter(news => news.id !== id);
    
    if (filteredNews.length === allNews.length) return false;
    
    this.saveNews(filteredNews);
    // Также удаляем все клики по этой новости
    this.deleteClicksByNewsId(id);
    return true;
  }

  // Отслеживание кликов
  trackClick(newsId: string, userId: string, userEmail: string, userName: string): void {
    const clicks = this.getAllClicks();
    const newClick: NewsClick = {
      id: this.generateId(),
      newsId,
      userId,
      userEmail,
      userName,
      clickedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ipAddress: 'unknown' // В реальном приложении получали бы с сервера
    };
    
    clicks.push(newClick);
    this.saveClicks(clicks);
  }

  getAllClicks(): NewsClick[] {
    try {
      const clicks = localStorage.getItem(this.CLICKS_KEY);
      return clicks ? JSON.parse(clicks) : [];
    } catch (error) {
      console.error('Ошибка загрузки кликов:', error);
      return [];
    }
  }

  getClicksByNewsId(newsId: string): NewsClick[] {
    return this.getAllClicks().filter(click => click.newsId === newsId);
  }

  getClicksByUserId(userId: string): NewsClick[] {
    return this.getAllClicks().filter(click => click.userId === userId);
  }

  // Аналитика
  getNewsAnalytics(newsId: string): NewsAnalytics | null {
    const news = this.getNewsById(newsId);
    if (!news) return null;

    const clicks = this.getClicksByNewsId(newsId);
    const uniqueUsers = new Set(clicks.map(click => click.userId)).size;
    
    // Группировка кликов по пользователям
    const clicksByUser = clicks.reduce((acc, click) => {
      const existing = acc.find(item => item.userId === click.userId);
      if (existing) {
        existing.clickCount++;
        if (new Date(click.clickedAt) > new Date(existing.lastClick)) {
          existing.lastClick = click.clickedAt;
        }
      } else {
        acc.push({
          userId: click.userId,
          userName: click.userName,
          userEmail: click.userEmail,
          clickCount: 1,
          lastClick: click.clickedAt
        });
      }
      return acc;
    }, [] as NewsAnalytics['clicksByUser']);

    // Группировка кликов по датам
    const clicksByDate = clicks.reduce((acc, click) => {
      const date = click.clickedAt.split('T')[0];
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.clicks++;
      } else {
        acc.push({ date, clicks: 1 });
      }
      return acc;
    }, [] as NewsAnalytics['clicksByDate']);

    return {
      newsId,
      newsTitle: news.title,
      totalClicks: clicks.length,
      uniqueUsers,
      clicksByUser: clicksByUser.sort((a, b) => b.clickCount - a.clickCount),
      clicksByDate: clicksByDate.sort((a, b) => a.date.localeCompare(b.date))
    };
  }

  getAllAnalytics(): NewsAnalytics[] {
    const news = this.getAllNews();
    return news.map(news => this.getNewsAnalytics(news.id)).filter(Boolean) as NewsAnalytics[];
  }

  getAnalyticsByCategory(category: NewsCategory): NewsAnalytics[] {
    const news = this.getNewsByCategory(category);
    return news.map(news => this.getNewsAnalytics(news.id)).filter(Boolean) as NewsAnalytics[];
  }

  // Получение данных о переходах для экспорта
  getUserClicksData(category?: NewsCategory): UserNewsClickData[] {
    const allClicks = this.getAllClicks();
    const news = this.getAllNews();
    
    // Фильтруем клики по категории, если указана
    const filteredClicks = category 
      ? allClicks.filter(click => {
          const newsItem = news.find(n => n.id === click.newsId);
          return newsItem && newsItem.category === category;
        })
      : allClicks;

    // Группируем клики по пользователю и новости для подсчета количества переходов
    const groupedClicks = filteredClicks.reduce((acc, click) => {
      const key = `${click.userId}-${click.newsId}`;
      if (!acc[key]) {
        const newsItem = news.find(n => n.id === click.newsId);
        if (newsItem) {
          acc[key] = {
            userId: click.userId,
            userName: click.userName,
            userEmail: click.userEmail,
            newsId: click.newsId,
            newsTitle: newsItem.title,
            category: newsItem.category,
            clickedAt: click.clickedAt,
            clickCount: 1
          };
        }
      } else {
        acc[key].clickCount++;
        // Обновляем дату на самую последнюю
        if (new Date(click.clickedAt) > new Date(acc[key].clickedAt)) {
          acc[key].clickedAt = click.clickedAt;
        }
      }
      return acc;
    }, {} as Record<string, UserNewsClickData>);

    // Преобразуем в массив и сортируем по дате (сначала новые)
    return Object.values(groupedClicks).sort((a, b) => 
      new Date(b.clickedAt).getTime() - new Date(a.clickedAt).getTime()
    );
  }

  // Приватные методы
  private saveNews(news: NewsItem[]): void {
    localStorage.setItem(this.NEWS_KEY, JSON.stringify(news));
  }

  private saveClicks(clicks: NewsClick[]): void {
    localStorage.setItem(this.CLICKS_KEY, JSON.stringify(clicks));
  }

  private deleteClicksByNewsId(newsId: string): void {
    const clicks = this.getAllClicks();
    const filteredClicks = clicks.filter(click => click.newsId !== newsId);
    this.saveClicks(filteredClicks);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getInitialNews(): NewsItem[] {
    const initialNews: NewsItem[] = [
      {
        id: '1',
        title: 'QS World University Rankings 2026 нәтижелері',
        description: 'Университет имени Есенова вошел в рейтинг QS World University Rankings 2026',
        date: '01.07.2025',
        category: 'rating',
        categoryKey: 'rating',
        image: '/qs.jpeg',
        link: 'https://yu.edu.kz/qs-world-university-rankings-2026-n%d3%99tizheleri/',
        isActive: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'КІНІ және ДКУ әкілдерінің бірлескен отырысы',
        description: 'Совместное заседание представителей КИНИ и ДКУ',
        date: '01.07.2025',
        category: 'international',
        categoryKey: 'international',
        image: '/Az.jpeg',
        link: 'https://yu.edu.kz/kini-zh%d3%99ne-dku-%d3%a9kilderinin-birlesken-otyrysy-2/',
        isActive: true,
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        title: 'КІНІ және ДКУ әкілдерінің бірлескен отырысы',
        description: 'Совместное заседание представителей КИНИ и ДКУ',
        date: '01.07.2025',
        category: 'science',
        categoryKey: 'science',
        image: '/kini.jpeg',
        link: 'https://yu.edu.kz/kini-zh%d3%99ne-dku-%d3%a9kilderinin-birlesken-otyrysy/',
        isActive: true,
        order: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        title: 'Сыбайлас жемқорлыққа қарсы менеджмент жүйесі',
        description: 'Система управления против коррупции',
        date: '01.07.2025',
        category: 'management',
        categoryKey: 'management',
        image: '/korup.jpeg',
        link: 'https://yu.edu.kz/sybajlas-zhemqorlyqqa-qarsy-menedzhment-zh%d2%afjesi/',
        isActive: true,
        order: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '5',
        title: 'COEST делегациясымен кездесу',
        description: 'Встреча с делегацией COEST',
        date: '30.06.2025',
        category: 'cooperation',
        categoryKey: 'cooperation',
        image: '/coest.jpeg',
        link: 'https://yu.edu.kz/coest-delegacziyasymen-kezdesu/',
        isActive: true,
        order: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '6',
        title: 'Шынабай Ақкенжеевтің атындағы аудиторияның ашылуы',
        description: 'Открытие аудитории имени Шынабая Ақкенжеева',
        date: '24.06.2025',
        category: 'opening',
        categoryKey: 'opening',
        image: '/Aqkenjeev.jpeg',
        link: 'https://yu.edu.kz/shynabaj-aqkenzheevtin-atynda%d2%93y-auditoriyanyn-ashyluy-2/',
        isActive: true,
        order: 6,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '7',
        title: 'Қазақстандық студенттер жаһандық байқауда жеңіске жетті',
        description: 'Казахстанские студенты добились успеха на международном конкурсе',
        date: '03.06.2025',
        category: 'achievements',
        categoryKey: 'achievements',
        image: '/students_inter.jpg',
        link: 'https://yu.edu.kz/qazaqstandyq-studentter-zha%d2%bbandyq-bajqauda-zheniske-zhetti/',
        isActive: true,
        order: 7,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '8',
        title: 'XVII Республикалық пәндік олимпиадасы II кезеңі өтті',
        description: 'Прошел II этап XVII Республиканской предметной олимпиады',
        date: '19.11.2025',
        category: 'olympiad',
        categoryKey: 'olympiad',
        image: '/olimpiada.jpg',
        link: 'https://yu.edu.kz/ru/xvii-respublikalyq-p%D3%99ndik-olimpiadasy-ii-kezeni-%D3%A9tedi/',
        isActive: true,
        order: 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    this.saveNews(initialNews);
    return initialNews;
  }
}

export const newsService = new NewsService();
