import { NewsItem } from '@/lib/types/news';

export interface YUNewsItem {
  id: string;
  title: string;
  link: string;
  date: string;
  image: string;
  description?: string;
}

class YUNewsService {
  private readonly CACHE_KEY = 'yu_news_cache';
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 минут

  async getLatestNews(): Promise<YUNewsItem[]> {
    try {
      console.log('YUNewsService: Starting to fetch news from API...');
      
      // Проверяем кэш
      const cached = this.getCachedNews();
      if (cached && cached.length > 0) {
        console.log('YUNewsService: Using cached news:', cached.length);
        return cached;
      }

      console.log('YUNewsService: Fetching from API...');
      
      // Получаем новости с API
      const response = await fetch('/api/news/parse');
      console.log('YUNewsService: API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('YUNewsService: API response data:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch news');
      }

      if (!data.news || data.news.length === 0) {
        console.log('YUNewsService: No news in response');
        return [];
      }

      // Кэшируем результат
      this.setCachedNews(data.news);
      
      console.log('YUNewsService: Successfully fetched news:', data.news.length);
      return data.news;
    } catch (error) {
      console.error('YUNewsService: Error fetching YU news:', error);
      return [];
    }
  }

  private getCachedNews(): YUNewsItem[] | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      if (now - timestamp > this.CACHE_DURATION) {
        localStorage.removeItem(this.CACHE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error reading cached news:', error);
      return null;
    }
  }

  private setCachedNews(news: YUNewsItem[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheData = {
        data: news,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching news:', error);
    }
  }

  // Преобразуем YU новости в формат NewsItem для совместимости с существующим дизайном
  convertToNewsItem(yuNews: YUNewsItem): NewsItem {
    return {
      id: yuNews.id,
      title: yuNews.title,
      titleEn: yuNews.title,
      titleKz: yuNews.title,
      description: yuNews.description || yuNews.title,
      descriptionEn: yuNews.description || yuNews.title,
      descriptionKz: yuNews.description || yuNews.title,
      content: yuNews.description || yuNews.title,
      contentEn: yuNews.description || yuNews.title,
      contentKz: yuNews.description || yuNews.title,
      excerpt: yuNews.description || yuNews.title,
      excerptEn: yuNews.description || yuNews.title,
      excerptKz: yuNews.description || yuNews.title,
      image: yuNews.image,
      link: yuNews.link,
      categoryId: '1', // Рейтинги по умолчанию
      category: {
        id: '1',
        name: 'YU News',
        nameEn: 'YU News',
        nameKz: 'YU News',
        color: '#3B82F6',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      tags: [],
      status: 'published' as const,
      publishedAt: this.parseDate(yuNews.date),
      authorId: 'yu-parser',
      authorName: 'YU Parser',
      authorEmail: 'parser@yu.edu.kz',
      viewCount: 0,
      isFeatured: false,
      isBreaking: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private parseDate(dateStr: string): string {
    try {
      // Парсим дату в формате "Сен 19, 2025"
      const months: { [key: string]: string } = {
        'Янв': '01', 'Фев': '02', 'Мар': '03', 'Апр': '04',
        'Май': '05', 'Июн': '06', 'Июл': '07', 'Авг': '08',
        'Сен': '09', 'Окт': '10', 'Ноя': '11', 'Дек': '12'
      };

      const parts = dateStr.split(' ');
      if (parts.length === 3) {
        const month = months[parts[0]];
        const day = parts[1].replace(',', '').padStart(2, '0');
        const year = parts[2];
        
        if (month) {
          return `${year}-${month}-${day}T00:00:00.000Z`;
        }
      }
    } catch (error) {
      console.error('Error parsing date:', error);
    }
    
    return new Date().toISOString();
  }
}

export const yuNewsService = new YUNewsService();
