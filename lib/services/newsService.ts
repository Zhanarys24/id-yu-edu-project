import { 
  NewsItem, 
  NewsCategory, 
  NewsTag, 
  NewsClickData, 
  NewsAnalytics, 
  NewsDatabase, 
  NewsStatus,
  INITIAL_NEWS_CATEGORIES,
  INITIAL_NEWS_TAGS
} from '@/lib/types/news';
import { RegisteredUser } from '@/lib/types/user';
import { createExampleNews } from './exampleNewsData';

class NewsService {
  private readonly STORAGE_KEY = 'news_database';

  private getDatabase(): NewsDatabase {
    if (typeof window === 'undefined') {
      return {
        news: [],
        categories: INITIAL_NEWS_CATEGORIES,
        tags: INITIAL_NEWS_TAGS,
        clicks: [],
        nextNewsId: 1,
        nextCategoryId: INITIAL_NEWS_CATEGORIES.length + 1,
        nextTagId: INITIAL_NEWS_TAGS.length + 1,
        nextClickId: 1
      };
    }

    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          categories: parsed.categories || INITIAL_NEWS_CATEGORIES,
          tags: parsed.tags || INITIAL_NEWS_TAGS,
          nextCategoryId: parsed.nextCategoryId || INITIAL_NEWS_CATEGORIES.length + 1,
          nextTagId: parsed.nextTagId || INITIAL_NEWS_TAGS.length + 1,
        };
      } catch (error) {
        console.error('Error parsing news database:', error);
      }
    }

    // Если база данных пустая, создаем примеры новостей
    const exampleNews = createExampleNews();
    
    return {
      news: exampleNews,
      categories: INITIAL_NEWS_CATEGORIES,
      tags: INITIAL_NEWS_TAGS,
      clicks: [],
      nextNewsId: exampleNews.length + 1,
      nextCategoryId: INITIAL_NEWS_CATEGORIES.length + 1,
      nextTagId: INITIAL_NEWS_TAGS.length + 1,
      nextClickId: 1
    };
  }

  private saveDatabase(database: NewsDatabase): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(database));
  }

  // News CRUD operations
  getAllNews(): NewsItem[] {
    const database = this.getDatabase();
    return database.news.map(news => ({
      ...news,
      category: database.categories.find(cat => cat.id === news.categoryId),
      tagObjects: database.tags.filter(tag => news.tags.includes(tag.id))
    }));
  }

  getNewsById(id: string): NewsItem | null {
    const database = this.getDatabase();
    const news = database.news.find(n => n.id === id);
    if (!news) return null;

    return {
      ...news,
      category: database.categories.find(cat => cat.id === news.categoryId),
      tagObjects: database.tags.filter(tag => news.tags.includes(tag.id))
    };
  }

  getPublishedNews(): NewsItem[] {
    return this.getAllNews().filter(news => news.status === 'published');
  }

  // Alias for compatibility with hooks expecting "active" news
  getActiveNews(): NewsItem[] {
    return this.getPublishedNews();
  }

  getNewsByStatus(status: NewsStatus): NewsItem[] {
    return this.getAllNews().filter(news => news.status === status);
  }

  getNewsByCategory(categoryId: string): NewsItem[] {
    return this.getAllNews().filter(news => news.categoryId === categoryId);
  }

  getNewsByTag(tagId: string): NewsItem[] {
    return this.getAllNews().filter(news => news.tags.includes(tagId));
  }

  getFeaturedNews(): NewsItem[] {
    return this.getPublishedNews().filter(news => news.isFeatured);
  }

  getBreakingNews(): NewsItem[] {
    return this.getPublishedNews().filter(news => news.isBreaking);
  }

  createNews(newsData: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>): NewsItem {
    const database = this.getDatabase();
    const now = new Date().toISOString();
    
    const newNews: NewsItem = {
      ...newsData,
      id: database.nextNewsId.toString(),
      viewCount: 0,
      createdAt: now,
      updatedAt: now
    };

    database.news.push(newNews);
    database.nextNewsId++;
    this.saveDatabase(database);

    return this.getNewsById(newNews.id)!;
  }

  updateNews(id: string, updates: Partial<Omit<NewsItem, 'id' | 'createdAt' | 'viewCount'>>): NewsItem | null {
    const database = this.getDatabase();
    const newsIndex = database.news.findIndex(n => n.id === id);
    
    if (newsIndex === -1) return null;

    database.news[newsIndex] = {
      ...database.news[newsIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveDatabase(database);
    return this.getNewsById(id);
  }

  deleteNews(id: string): boolean {
    const database = this.getDatabase();
    const newsIndex = database.news.findIndex(n => n.id === id);
    
    if (newsIndex === -1) return false;

    database.news.splice(newsIndex, 1);
    this.saveDatabase(database);
    return true;
  }

  publishNews(id: string): NewsItem | null {
    return this.updateNews(id, {
      status: 'published',
      publishedAt: new Date().toISOString()
    });
  }

  archiveNews(id: string): NewsItem | null {
    return this.updateNews(id, {
      status: 'archived',
      archivedAt: new Date().toISOString()
    });
  }

  incrementViewCount(id: string): void {
    const database = this.getDatabase();
    const news = database.news.find(n => n.id === id);
    if (news) {
      news.viewCount++;
      this.saveDatabase(database);
    }
  }

  // Categories CRUD operations
  getAllCategories(): NewsCategory[] {
    const database = this.getDatabase();
    return database.categories;
  }

  getCategoryById(id: string): NewsCategory | null {
    const database = this.getDatabase();
    return database.categories.find(cat => cat.id === id) || null;
  }

  createCategory(categoryData: Omit<NewsCategory, 'id' | 'createdAt' | 'updatedAt'>): NewsCategory {
    const database = this.getDatabase();
    const now = new Date().toISOString();
    
    const newCategory: NewsCategory = {
      ...categoryData,
      id: database.nextCategoryId.toString(),
      createdAt: now,
      updatedAt: now
    };

    database.categories.push(newCategory);
    database.nextCategoryId++;
    this.saveDatabase(database);

    return newCategory;
  }

  updateCategory(id: string, updates: Partial<Omit<NewsCategory, 'id' | 'createdAt'>>): NewsCategory | null {
    const database = this.getDatabase();
    const categoryIndex = database.categories.findIndex(cat => cat.id === id);
    
    if (categoryIndex === -1) return null;

    database.categories[categoryIndex] = {
      ...database.categories[categoryIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveDatabase(database);
    return database.categories[categoryIndex];
  }

  deleteCategory(id: string): boolean {
    const database = this.getDatabase();
    const categoryIndex = database.categories.findIndex(cat => cat.id === id);
    
    if (categoryIndex === -1) return false;

    // Check if any news uses this category
    const newsUsingCategory = database.news.some(news => news.categoryId === id);
    if (newsUsingCategory) {
      throw new Error('Cannot delete category that is being used by news items');
    }

    database.categories.splice(categoryIndex, 1);
    this.saveDatabase(database);
    return true;
  }

  // Tags CRUD operations
  getAllTags(): NewsTag[] {
    const database = this.getDatabase();
    return database.tags;
  }

  getTagById(id: string): NewsTag | null {
    const database = this.getDatabase();
    return database.tags.find(tag => tag.id === id) || null;
  }

  createTag(tagData: Omit<NewsTag, 'id' | 'createdAt' | 'updatedAt'>): NewsTag {
    const database = this.getDatabase();
    const now = new Date().toISOString();
    
    const newTag: NewsTag = {
      ...tagData,
      id: database.nextTagId.toString(),
      createdAt: now,
      updatedAt: now
    };

    database.tags.push(newTag);
    database.nextTagId++;
    this.saveDatabase(database);

    return newTag;
  }

  updateTag(id: string, updates: Partial<Omit<NewsTag, 'id' | 'createdAt'>>): NewsTag | null {
    const database = this.getDatabase();
    const tagIndex = database.tags.findIndex(tag => tag.id === id);
    
    if (tagIndex === -1) return null;

    database.tags[tagIndex] = {
      ...database.tags[tagIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveDatabase(database);
    return database.tags[tagIndex];
  }

  deleteTag(id: string): boolean {
    const database = this.getDatabase();
    const tagIndex = database.tags.findIndex(tag => tag.id === id);
    
    if (tagIndex === -1) return false;

    // Remove tag from all news items
    database.news.forEach(news => {
      news.tags = news.tags.filter(tagId => tagId !== id);
    });

    database.tags.splice(tagIndex, 1);
    this.saveDatabase(database);
    return true;
  }

  // Click tracking
  trackNewsClick(newsId: string, user: RegisteredUser, userAgent?: string, ipAddress?: string): void {
    const database = this.getDatabase();
    const now = new Date().toISOString();
    
    const clickData: NewsClickData = {
      id: database.nextClickId.toString(),
      newsId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      clickedAt: now,
      userAgent,
      ipAddress
    };

    database.clicks.push(clickData);
    database.nextClickId++;
    this.saveDatabase(database);

    // Increment view count
    this.incrementViewCount(newsId);
  }

  getAllClicks(): NewsClickData[] {
    const database = this.getDatabase();
    return database.clicks;
  }

  getClicksByNewsId(newsId: string): NewsClickData[] {
    return this.getAllClicks().filter(click => click.newsId === newsId);
  }

  getClicksByUserId(userId: string): NewsClickData[] {
    return this.getAllClicks().filter(click => click.userId === userId);
  }

  // Analytics
  getAnalytics(): NewsAnalytics {
    const database = this.getDatabase();
    const allNews = this.getAllNews();
    const allClicks = this.getAllClicks();

    const publishedNews = allNews.filter(news => news.status === 'published');
    const scheduledNews = allNews.filter(news => news.status === 'scheduled');
    const archivedNews = allNews.filter(news => news.status === 'archived');

    const totalViews = allNews.reduce((sum, news) => sum + news.viewCount, 0);
    const totalClicks = allClicks.length;
    const uniqueReaders = new Set(allClicks.map(click => click.userId)).size;

    // Top news by views and clicks
    const topNews = publishedNews
      .map(news => ({
        news,
        viewCount: news.viewCount,
        clickCount: allClicks.filter(click => click.newsId === news.id).length
      }))
      .sort((a, b) => (b.viewCount + b.clickCount) - (a.viewCount + a.clickCount))
      .slice(0, 10);

    // Top categories
    const topCategories = database.categories.map(category => {
      const categoryNews = allNews.filter(news => news.categoryId === category.id);
      const newsCount = categoryNews.length;
      const viewCount = categoryNews.reduce((sum, news) => sum + news.viewCount, 0);
      
      return { category, newsCount, viewCount };
    }).sort((a, b) => b.newsCount - a.newsCount);

    // Top tags
    const topTags = database.tags.map(tag => {
      const newsCount = allNews.filter(news => news.tags.includes(tag.id)).length;
      return { tag, newsCount };
    }).filter(item => item.newsCount > 0)
      .sort((a, b) => b.newsCount - a.newsCount);

    // Recent clicks
    const recentClicks = allClicks
      .sort((a, b) => new Date(b.clickedAt).getTime() - new Date(a.clickedAt).getTime())
      .slice(0, 20);

    // Views by date (last 30 days)
    const viewsByDate: Array<{ date: string; views: number; clicks: number }> = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayClicks = allClicks.filter(click => 
        click.clickedAt.startsWith(dateStr)
      );
      
      const dayViews = allNews.reduce((sum, news) => {
        // This is a simplified calculation - in real app you'd track daily views
        return sum + Math.floor(news.viewCount / 30);
      }, 0);

      viewsByDate.push({
        date: dateStr,
        views: dayViews,
        clicks: dayClicks.length
      });
    }

    return {
      totalNews: allNews.length,
      publishedNews: publishedNews.length,
      scheduledNews: scheduledNews.length,
      archivedNews: archivedNews.length,
      totalViews,
      totalClicks,
      uniqueReaders,
      topNews,
      topCategories,
      topTags,
      recentClicks,
      viewsByDate
    };
  }

  // Search functionality
  searchNews(query: string): NewsItem[] {
    const allNews = this.getAllNews();
    const lowercaseQuery = query.toLowerCase();
    
    return allNews.filter(news => 
      news.title.toLowerCase().includes(lowercaseQuery) ||
      news.description.toLowerCase().includes(lowercaseQuery) ||
      news.content.toLowerCase().includes(lowercaseQuery) ||
      news.excerpt.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Utility methods
  getNewsCountByStatus(): Record<NewsStatus, number> {
    const allNews = this.getAllNews();
    return {
      draft: allNews.filter(n => n.status === 'draft').length,
      published: allNews.filter(n => n.status === 'published').length,
      archived: allNews.filter(n => n.status === 'archived').length,
      scheduled: allNews.filter(n => n.status === 'scheduled').length
    };
  }

  getNewsCountByCategory(): Array<{ category: NewsCategory; count: number }> {
    const database = this.getDatabase();
    const allNews = this.getAllNews();
    
    return database.categories.map(category => ({
      category,
      count: allNews.filter(news => news.categoryId === category.id).length
    }));
  }
}

export const newsService = new NewsService();