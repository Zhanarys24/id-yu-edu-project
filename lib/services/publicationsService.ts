import { Publication } from '@/lib/types/portfolio';

export interface PublicationByYear {
  year: number;
  publications: Publication[];
  count: number;
}

export interface PublicationStats {
  total: number;
  byYear: PublicationByYear[];
  journals: number;
  withDOI: number;
  recentYear: number;
}

class PublicationsService {
  /**
   * Получить публикации пользователя за последние 10 лет
   */
  getUserPublicationsByYear(userId: string): PublicationByYear[] {
    const currentYear = new Date().getFullYear();
    const years: PublicationByYear[] = [];
    
    // Создаем массив для последних 10 лет
    for (let year = currentYear; year >= currentYear - 9; year--) {
      const publications = this.getMockPublicationsForYear(userId, year);
      years.push({
        year,
        publications,
        count: publications.length
      });
    }
    
    return years;
  }

  /**
   * Получить статистику публикаций
   */
  getPublicationsStats(userId: string): PublicationStats {
    const publicationsByYear = this.getUserPublicationsByYear(userId);
    const allPublications = publicationsByYear.flatMap(year => year.publications);
    
    return {
      total: allPublications.length,
      byYear: publicationsByYear,
      journals: [...new Set(allPublications.map(p => p.journal).filter(Boolean))].length,
      withDOI: allPublications.filter(p => p.doi).length,
      recentYear: publicationsByYear[0]?.count || 0
    };
  }

  /**
   * Тестовые данные для каждого года
   */
  private getMockPublicationsForYear(userId: string, year: number): Publication[] {
    const publications: Publication[] = [];
    const currentYear = new Date().getFullYear();
    
    // Генерируем разное количество публикаций для каждого года
    const yearIndex = currentYear - year;
    const baseCount = this.getPublicationCountForYear(yearIndex);
    
    for (let i = 0; i < baseCount; i++) {
      publications.push(this.createMockPublication(userId, year, i + 1));
    }
    
    return publications;
  }

  /**
   * Определяем количество публикаций для каждого года
   */
  private getPublicationCountForYear(yearIndex: number): number {
    const counts = [3, 2, 4, 1, 5, 2, 3, 1, 2, 0]; // 2024, 2023, 2022, ..., 2015
    return counts[yearIndex] || 0;
  }

  /**
   * Создать тестовую публикацию
   */
  private createMockPublication(userId: string, year: number, index: number): Publication {
    const titles = [
      'Исследование применения искусственного интеллекта в образовании',
      'Методы машинного обучения в анализе больших данных',
      'Цифровая трансформация университетов в эпоху Industry 4.0',
      'Инновационные подходы к дистанционному обучению',
      'Анализ эффективности онлайн-образования',
      'Применение блокчейн-технологий в образовании',
      'Виртуальная и дополненная реальность в обучении',
      'Адаптивные системы обучения на основе ИИ',
      'Геймификация в образовательном процессе',
      'Персонализированное обучение с использованием данных'
    ];

    const journals = [
      'Журнал современного образования',
      'Вестник информационных технологий',
      'Высшее образование в России',
      'Информатика и образование',
      'Педагогика и психология',
      'Научные исследования в образовании',
      'Цифровые технологии в образовании',
      'Инновации в образовании',
      'Современные образовательные технологии',
      'Электронное обучение'
    ];

    const authors = [
      ['Иванов И.И.', 'Петров П.П.'],
      ['Сидоров С.С.'],
      ['Козлов К.К.', 'Морозов М.М.', 'Лебедев Л.Л.'],
      ['Новиков Н.Н.', 'Волков В.В.'],
      ['Соколов С.С.', 'Попов П.П.', 'Васильев В.В.', 'Смирнов С.С.'],
      ['Кузнецов К.К.'],
      ['Орлов О.О.', 'Медведев М.М.'],
      ['Павлов П.П.'],
      ['Семенов С.С.', 'Голубев Г.Г.'],
      ['Титов Т.Т.', 'Комаров К.К.', 'Макаров М.М.']
    ];

    const title = titles[index % titles.length];
    const journal = journals[index % journals.length];
    const publicationAuthors = authors[index % authors.length];

    return {
      id: `pub_${year}_${index}`,
      userId,
      type: 'publications',
      title,
      description: `Аннотация к публикации "${title}" за ${year} год. Данная работа посвящена исследованию современных подходов и методов в области образования и информационных технологий.`,
      authors: publicationAuthors,
      journal,
      year: year.toString(),
      doi: `10.1234/example.${year}.${String(index).padStart(3, '0')}`,
      url: `https://ojs.yu.edu.kz/article/view/${year}${index}`,
      impactFactor: Math.round((Math.random() * 5 + 1) * 10) / 10,
      citations: Math.floor(Math.random() * 50) + 1,
      date: `${year}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      metadata: {
        source: 'mock',
        keywords: ['образование', 'технологии', 'исследование'],
        type: 'article'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

export const publicationsService = new PublicationsService();
