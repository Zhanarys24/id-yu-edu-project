import { 
  PortfolioItem, 
  PortfolioSection, 
  PortfolioDatabase, 
  INITIAL_PORTFOLIO,
  GeneralInfo,
  Publication,
  TeachingActivity,
  Achievement,
  AdditionalActivity,
  PortfolioFile
} from '@/lib/types/portfolio';

const PORTFOLIO_STORAGE_KEY = 'portfolio_database';

class PortfolioService {
  private getPortfolioDatabase(): PortfolioDatabase {
    if (typeof window === 'undefined') {
      return { items: INITIAL_PORTFOLIO, nextId: 1 };
    }

    const stored = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing portfolio database:', error);
      }
    }

    const initialDb: PortfolioDatabase = {
      items: INITIAL_PORTFOLIO,
      nextId: 1
    };
    this.savePortfolioDatabase(initialDb);
    return initialDb;
  }

  private savePortfolioDatabase(db: PortfolioDatabase): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(db));
    }
  }

  // Получить все элементы портфолио пользователя
  getUserPortfolio(userId: string): PortfolioItem[] {
    const db = this.getPortfolioDatabase();
    return db.items.filter(item => item.userId === userId);
  }

  // Получить элементы портфолио по типу для пользователя
  getUserPortfolioByType(userId: string, type: PortfolioSection): PortfolioItem[] {
    const db = this.getPortfolioDatabase();
    return db.items.filter(item => item.userId === userId && item.type === type);
  }

  // Добавить новый элемент портфолио
  addPortfolioItem(userId: string, item: Omit<PortfolioItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): PortfolioItem {
    const db = this.getPortfolioDatabase();
    const now = new Date().toISOString();
    
    const newItem: PortfolioItem = {
      ...item,
      id: db.nextId.toString(),
      userId,
      createdAt: now,
      updatedAt: now
    };

    db.items.push(newItem);
    db.nextId++;
    this.savePortfolioDatabase(db);
    
    return newItem;
  }

  // Обновить элемент портфолио
  updatePortfolioItem(itemId: string, updates: Partial<PortfolioItem>): PortfolioItem | null {
    const db = this.getPortfolioDatabase();
    const itemIndex = db.items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return null;
    }

    const updatedItem = {
      ...db.items[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    db.items[itemIndex] = updatedItem;
    this.savePortfolioDatabase(db);
    
    return updatedItem;
  }

  // Удалить элемент портфолио
  deletePortfolioItem(itemId: string): boolean {
    const db = this.getPortfolioDatabase();
    const itemIndex = db.items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return false;
    }

    db.items.splice(itemIndex, 1);
    this.savePortfolioDatabase(db);
    return true;
  }

  // Получить общую информацию пользователя
  getUserGeneralInfo(userId: string): GeneralInfo | null {
    const items = this.getUserPortfolioByType(userId, 'general');
    return items.length > 0 ? items[0] as GeneralInfo : null;
  }

  // Создать или обновить общую информацию
  saveGeneralInfo(userId: string, data: Omit<GeneralInfo, 'id' | 'userId' | 'type' | 'createdAt' | 'updatedAt'>): GeneralInfo {
    const existing = this.getUserGeneralInfo(userId);
    
    if (existing) {
      return this.updatePortfolioItem(existing.id, data) as GeneralInfo;
    } else {
      return this.addPortfolioItem(userId, {
        ...data,
        type: 'general',
        title: 'Общая информация'
      }) as GeneralInfo;
    }
  }

  // Получить публикации пользователя
  getUserPublications(userId: string): Publication[] {
    return this.getUserPortfolioByType(userId, 'publications') as Publication[];
  }

  // Добавить публикацию
  addPublication(userId: string, data: Omit<Publication, 'id' | 'userId' | 'type' | 'createdAt' | 'updatedAt'>): Publication {
    return this.addPortfolioItem(userId, {
      ...data,
      type: 'publications'
    }) as Publication;
  }

  // Получить преподавательскую деятельность
  getUserTeachingActivities(userId: string): TeachingActivity[] {
    return this.getUserPortfolioByType(userId, 'teaching') as TeachingActivity[];
  }

  // Добавить преподавательскую деятельность
  addTeachingActivity(userId: string, data: Omit<TeachingActivity, 'id' | 'userId' | 'type' | 'createdAt' | 'updatedAt'>): TeachingActivity {
    return this.addPortfolioItem(userId, {
      ...data,
      type: 'teaching'
    }) as TeachingActivity;
  }

  // Получить достижения пользователя
  getUserAchievements(userId: string): Achievement[] {
    return this.getUserPortfolioByType(userId, 'achievements') as Achievement[];
  }

  // Добавить достижение
  addAchievement(userId: string, data: Omit<Achievement, 'id' | 'userId' | 'type' | 'createdAt' | 'updatedAt'>): Achievement {
    return this.addPortfolioItem(userId, {
      ...data,
      type: 'achievements'
    }) as Achievement;
  }

  // Получить дополнительную деятельность
  getUserAdditionalActivities(userId: string): AdditionalActivity[] {
    return this.getUserPortfolioByType(userId, 'additional') as AdditionalActivity[];
  }

  // Добавить дополнительную деятельность
  addAdditionalActivity(userId: string, data: Omit<AdditionalActivity, 'id' | 'userId' | 'type' | 'createdAt' | 'updatedAt'>): AdditionalActivity {
    return this.addPortfolioItem(userId, {
      ...data,
      type: 'additional'
    }) as AdditionalActivity;
  }

  // Получить статистику портфолио пользователя
  getUserPortfolioStats(userId: string) {
    const items = this.getUserPortfolio(userId);
    const stats = {
      total: items.length,
      general: items.filter(i => i.type === 'general').length,
      publications: items.filter(i => i.type === 'publications').length,
      teaching: items.filter(i => i.type === 'teaching').length,
      achievements: items.filter(i => i.type === 'achievements').length,
      additional: items.filter(i => i.type === 'additional').length
    };
    
    return stats;
  }

  // Добавить файл к элементу портфолио
  addFileToPortfolioItem(itemId: string, file: Omit<PortfolioFile, 'id' | 'uploadedAt'>): PortfolioFile | null {
    const db = this.getPortfolioDatabase();
    const itemIndex = db.items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return null;
    }

    const newFile: PortfolioFile = {
      ...file,
      id: db.nextId.toString(),
      uploadedAt: new Date().toISOString()
    };

    if (!db.items[itemIndex].attachments) {
      db.items[itemIndex].attachments = [];
    }

    db.items[itemIndex].attachments!.push(newFile);
    db.nextId++;
    this.savePortfolioDatabase(db);
    
    return newFile;
  }

  // Удалить файл из элемента портфолио
  removeFileFromPortfolioItem(itemId: string, fileId: string): boolean {
    const db = this.getPortfolioDatabase();
    const itemIndex = db.items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return false;
    }

    const item = db.items[itemIndex];
    if (!item.attachments) {
      return false;
    }

    const fileIndex = item.attachments.findIndex(file => file.id === fileId);
    if (fileIndex === -1) {
      return false;
    }

    item.attachments.splice(fileIndex, 1);
    this.savePortfolioDatabase(db);
    return true;
  }

  // Получить все файлы пользователя
  getUserFiles(userId: string): PortfolioFile[] {
    const items = this.getUserPortfolio(userId);
    const files: PortfolioFile[] = [];
    
    items.forEach(item => {
      if (item.attachments) {
        files.push(...item.attachments);
      }
    });
    
    return files;
  }
}

export const portfolioService = new PortfolioService();
