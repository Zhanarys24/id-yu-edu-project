import { NewsItem } from '@/lib/types/news';

export const createExampleNews = (): NewsItem[] => {
  const now = '2024-01-15T10:00:00.000Z'; // Статическая дата для избежания проблем с гидратацией
  
  return [
    {
      id: '1',
      title: 'YU вошел в топ-500 лучших университетов мира по версии QS',
      titleEn: 'YU enters top 500 world universities according to QS rankings',
      titleKz: 'YU QS рейтингі бойынша әлемдегі ең үздік 500 университетінің қатарына кірді',
      description: 'Университет имени Есенова достиг значительного прогресса в международных рейтингах, поднявшись на 50 позиций и войдя в топ-500 лучших университетов мира.',
      descriptionEn: 'Yessenov University has made significant progress in international rankings, rising 50 positions and entering the top 500 world universities.',
      descriptionKz: 'Есенов атындағы университет халықаралық рейтингтерде айтарлықтай прогресс жасап, 50 орынға көтеріліп, әлемдегі ең үздік 500 университетінің қатарына кірді.',
      content: 'Университет имени Есенова (YU) достиг исторического результата, войдя в топ-500 лучших университетов мира по версии QS World University Rankings 2025. Это значительное достижение для казахстанского высшего образования.\n\nРектор университета отметил, что этот успех стал возможен благодаря упорной работе всего коллектива, модернизации образовательных программ и укреплению международного сотрудничества.',
      contentEn: 'Yessenov University (YU) has achieved a historic result by entering the top 500 world universities according to QS World University Rankings 2025. This is a significant achievement for Kazakhstani higher education.\n\nThe university rector noted that this success was made possible through the hard work of the entire team, modernization of educational programs, and strengthening of international cooperation.',
      contentKz: 'Есенов атындағы университет (YU) QS World University Rankings 2025 бойынша әлемдегі ең үздік 500 университетінің қатарына кіру арқылы тарихи нәтижеге қол жеткізді. Бұл Қазақстан жоғары білім беруі үшін маңызды жетістік.\n\nУниверситет ректоры бұл табыстың бүкіл ұжымның қажырлы еңбегі, білім беру бағдарламаларын заманауиландыру және халықаралық ынтымақтастықты нығайту арқылы мүмкін болғанын атап өтті.',
      excerpt: 'YU достиг исторического результата, войдя в топ-500 лучших университетов мира по версии QS World University Rankings 2025.',
      excerptEn: 'YU achieved a historic result by entering the top 500 world universities according to QS World University Rankings 2025.',
      excerptKz: 'YU QS World University Rankings 2025 бойынша әлемдегі ең үздік 500 университетінің қатарына кіру арқылы тарихи нәтижеге қол жеткізді.',
      image: '/qs.jpeg',
      imageAlt: 'QS World University Rankings 2025 - YU в топ-500',
      categoryId: '1', // Рейтинги
      tags: ['1', '3'], // Важное, Образование
      status: 'published',
      publishedAt: now,
      authorId: '1',
      authorName: 'Администратор',
      authorEmail: 'admin@yu.edu.kz',
      viewCount: 0,
      isFeatured: true,
      isBreaking: false,
      seoTitle: 'YU в топ-500 университетов мира QS 2025',
      seoDescription: 'Университет имени Есенова вошел в топ-500 лучших университетов мира по версии QS World University Rankings 2025',
      seoKeywords: ['YU', 'университет', 'рейтинг', 'QS', 'топ-500', 'Казахстан'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: '2',
      title: 'Новое исследование в области искусственного интеллекта',
      titleEn: 'New research in artificial intelligence field',
      titleKz: 'Жасанды интеллект саласындағы жаңа зерттеу',
      description: 'Команда исследователей YU представила инновационное исследование в области машинного обучения и нейронных сетей.',
      descriptionEn: 'YU research team presented innovative research in machine learning and neural networks.',
      descriptionKz: 'YU зерттеу тобы машиналық оқыту және нейрондық желілер саласындағы инновациялық зерттеуді ұсынды.',
      content: 'Исследовательская группа Университета имени Есенова представила революционное исследование в области искусственного интеллекта. Работа открывает новые возможности для развития машинного обучения и создания более эффективных алгоритмов.',
      contentEn: 'Yessenov University research group presented revolutionary research in artificial intelligence. The work opens new possibilities for machine learning development and creating more efficient algorithms.',
      contentKz: 'Есенов атындағы университеттің зерттеу тобы жасанды интеллект саласындағы революциялық зерттеуді ұсынды. Жұмыс машиналық оқытуды дамыту және тиімдірек алгоритмдер жасау үшін жаңа мүмкіндіктер ашады.',
      excerpt: 'Новое исследование в области искусственного интеллекта открывает новые возможности.',
      excerptEn: 'New research in artificial intelligence opens new possibilities.',
      excerptKz: 'Жасанды интеллект саласындағы жаңа зерттеу жаңа мүмкіндіктер ашады.',
      image: '/kini.jpeg',
      imageAlt: 'Исследование в области ИИ',
      categoryId: '', // Без категории
      tags: ['4'], // Исследования
      status: 'published',
      publishedAt: now,
      authorId: '1',
      authorName: 'Администратор',
      authorEmail: 'admin@yu.edu.kz',
      viewCount: 0,
      isFeatured: false,
      isBreaking: false,
      seoTitle: 'Исследование ИИ в YU',
      seoDescription: 'Новое исследование в области искусственного интеллекта в Университете имени Есенова',
      seoKeywords: ['ИИ', 'исследование', 'машинное обучение', 'YU'],
      createdAt: now,
      updatedAt: now
    }
  ];
};