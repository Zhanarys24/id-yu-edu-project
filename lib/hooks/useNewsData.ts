import { useState, useEffect } from 'react';
import { newsService } from '@/lib/services/newsService';
import { NewsItem } from '@/lib/types/news';

export const useNewsData = () => {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNews = () => {
    try {
      const activeNews = newsService.getActiveNews();
      setNewsData(activeNews);
    } catch (error) {
      console.error('Ошибка загрузки новостей:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();

    // Слушаем изменения в localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'news_items') {
        loadNews();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Проверяем изменения каждые 2 секунды (для обновления в той же вкладке)
    const interval = setInterval(loadNews, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const refreshNews = () => {
    loadNews();
  };

  return { newsData, loading, refreshNews };
};
