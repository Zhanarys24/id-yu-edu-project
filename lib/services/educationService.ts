import { EducationCard, CardClick, CardAnalytics, EducationCategory, UserClickData } from '@/lib/types/education';

class EducationService {
  private readonly CARDS_KEY = 'education_cards';
  private readonly CLICKS_KEY = 'education_clicks';

  // Управление карточками
  getAllCards(): EducationCard[] {
    try {
      const cards = localStorage.getItem(this.CARDS_KEY);
      return cards ? JSON.parse(cards) : this.getInitialCards();
    } catch (error) {
      console.error('Ошибка загрузки карточек:', error);
      return this.getInitialCards();
    }
  }

  getCardsByCategory(category: EducationCategory): EducationCard[] {
    return this.getAllCards().filter(card => card.category === category);
  }

  getCardById(id: string): EducationCard | null {
    const cards = this.getAllCards();
    return cards.find(card => card.id === id) || null;
  }

  createCard(card: Omit<EducationCard, 'id' | 'createdAt' | 'updatedAt'>): EducationCard {
    const cards = this.getAllCards();
    const newCard: EducationCard = {
      ...card,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    cards.push(newCard);
    this.saveCards(cards);
    return newCard;
  }

  updateCard(id: string, updates: Partial<Omit<EducationCard, 'id' | 'createdAt'>>): boolean {
    const cards = this.getAllCards();
    const index = cards.findIndex(card => card.id === id);
    
    if (index === -1) return false;
    
    cards[index] = {
      ...cards[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveCards(cards);
    return true;
  }

  deleteCard(id: string): boolean {
    const cards = this.getAllCards();
    const filteredCards = cards.filter(card => card.id !== id);
    
    if (filteredCards.length === cards.length) return false;
    
    this.saveCards(filteredCards);
    // Также удаляем все клики по этой карточке
    this.deleteClicksByCardId(id);
    return true;
  }

  // Отслеживание кликов
  trackClick(cardId: string, userId: string, userEmail: string, userName: string): void {
    const clicks = this.getAllClicks();
    const newClick: CardClick = {
      id: this.generateId(),
      cardId,
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

  getAllClicks(): CardClick[] {
    try {
      const clicks = localStorage.getItem(this.CLICKS_KEY);
      return clicks ? JSON.parse(clicks) : [];
    } catch (error) {
      console.error('Ошибка загрузки кликов:', error);
      return [];
    }
  }

  getClicksByCardId(cardId: string): CardClick[] {
    return this.getAllClicks().filter(click => click.cardId === cardId);
  }

  getClicksByUserId(userId: string): CardClick[] {
    return this.getAllClicks().filter(click => click.userId === userId);
  }

  // Аналитика
  getCardAnalytics(cardId: string): CardAnalytics | null {
    const card = this.getCardById(cardId);
    if (!card) return null;

    const clicks = this.getClicksByCardId(cardId);
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
    }, [] as CardAnalytics['clicksByUser']);

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
    }, [] as CardAnalytics['clicksByDate']);

    return {
      cardId,
      cardTitle: card.title,
      totalClicks: clicks.length,
      uniqueUsers,
      clicksByUser: clicksByUser.sort((a, b) => b.clickCount - a.clickCount),
      clicksByDate: clicksByDate.sort((a, b) => a.date.localeCompare(b.date))
    };
  }

  getAllAnalytics(): CardAnalytics[] {
    const cards = this.getAllCards();
    return cards.map(card => this.getCardAnalytics(card.id)).filter(Boolean) as CardAnalytics[];
  }

  getAnalyticsByCategory(category: EducationCategory): CardAnalytics[] {
    const cards = this.getCardsByCategory(category);
    return cards.map(card => this.getCardAnalytics(card.id)).filter(Boolean) as CardAnalytics[];
  }

  // Получение данных о переходах для экспорта
  getUserClicksData(category?: EducationCategory): UserClickData[] {
    const allClicks = this.getAllClicks();
    const cards = this.getAllCards();
    
    // Фильтруем клики по категории, если указана
    const filteredClicks = category 
      ? allClicks.filter(click => {
          const card = cards.find(c => c.id === click.cardId);
          return card && card.category === category;
        })
      : allClicks;

    // Группируем клики по пользователю и карточке для подсчета количества переходов
    const groupedClicks = filteredClicks.reduce((acc, click) => {
      const key = `${click.userId}-${click.cardId}`;
      if (!acc[key]) {
        const card = cards.find(c => c.id === click.cardId);
        if (card) {
          acc[key] = {
            userId: click.userId,
            userName: click.userName,
            userEmail: click.userEmail,
            cardId: click.cardId,
            cardTitle: card.title,
            category: card.category,
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
    }, {} as Record<string, UserClickData>);

    // Преобразуем в массив и сортируем по дате (сначала новые)
    return Object.values(groupedClicks).sort((a, b) => 
      new Date(b.clickedAt).getTime() - new Date(a.clickedAt).getTime()
    );
  }

  // Приватные методы
  private saveCards(cards: EducationCard[]): void {
    localStorage.setItem(this.CARDS_KEY, JSON.stringify(cards));
  }

  private saveClicks(clicks: CardClick[]): void {
    localStorage.setItem(this.CLICKS_KEY, JSON.stringify(clicks));
  }

  private deleteClicksByCardId(cardId: string): void {
    const clicks = this.getAllClicks();
    const filteredClicks = clicks.filter(click => click.cardId !== cardId);
    this.saveClicks(filteredClicks);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getInitialCards(): EducationCard[] {
    const initialCards: EducationCard[] = [
      {
        id: 'canvas',
        title: 'Canvas',
        description: 'Система управления обучением Canvas',
        image: '/canvas.png',
        href: 'https://canvas.instructure.com',
        ctaLabel: 'Войти',
        category: 'education',
        isActive: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'platonus',
        title: 'Platonus',
        description: 'Информационная система Platonus',
        image: '/platonus.png',
        href: 'https://platonus.kz',
        ctaLabel: 'Войти',
        category: 'education',
        isActive: true,
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'lessons',
        title: 'Google Meet',
        description: 'Онлайн уроки через Google Meet',
        image: '/lessons.png',
        href: 'https://meet.google.com',
        ctaLabel: 'Войти',
        category: 'education',
        isActive: true,
        order: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'research',
        title: 'Исследовательская деятельность',
        description: 'Платформа для научных исследований',
        image: '/grant.png',
        href: 'https://research.yu.edu.kz',
        ctaLabel: 'Перейти',
        category: 'science',
        isActive: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'publications',
        title: 'Публикации',
        description: 'Система управления научными публикациями',
        image: '/OJS.png',
        href: 'https://ojs.yu.edu.kz',
        ctaLabel: 'Перейти',
        category: 'science',
        isActive: true,
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'student-clubs',
        title: 'Студенческие клубы',
        description: 'Активности и мероприятия для студентов',
        image: '/studentclubs-logo.png',
        href: 'https://clubs.yu.edu.kz',
        ctaLabel: 'Участвовать',
        category: 'upbringing',
        isActive: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'events',
        title: 'Мероприятия',
        description: 'Культурные и спортивные мероприятия',
        image: '/olimpiada.jpg',
        href: 'https://events.yu.edu.kz',
        ctaLabel: 'Участвовать',
        category: 'upbringing',
        isActive: true,
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    this.saveCards(initialCards);
    return initialCards;
  }
}

export const educationService = new EducationService();
