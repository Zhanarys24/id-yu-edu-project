'use client'

import { ChevronRight } from 'lucide-react'
import Layout from '@/components/Layout'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import '@/i18n'
import '@/styles/applications/applications.css'

// Типы для API приложений
interface ApiApplication {
  id: number;
  name: string;
  description: string | null;
  is_additional: boolean;
  url: string;
  image: string;
  can_iframe: boolean;
}

interface ApiApplicationsResponse {
  count: number;
  size: number;
  next: string | null;
  previous: string | null;
  results: ApiApplication[];
}

// Типы для карточек образования
interface EducationCard {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
  ctaLabel: string;
  category: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Типы для табов
type TabType = 'all' | 'education' | 'science' | 'upbringing';

// API для получения приложений через наш backend proxy
const ApplicationsApi = {
  getApplications: async (): Promise<ApiApplication[]> => {
    try {
      console.log('Запрос к /api/education/applications...');
      
      const response = await fetch('/api/education/applications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
      });

      console.log('Ответ от /api/education/applications:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`API error! status: ${response.status}, ответ:`, errorText);
        return [];
      }

      const data: ApiApplicationsResponse = await response.json();
      console.log('Получено приложений из API:', data.results?.length || 0);
      console.log('Данные API:', data);
      return data.results || [];
    } catch (error) {
      console.warn('Ошибка при получении приложений из API:', error);
      return [];
    }
  },

  convertToEducationCard: (app: ApiApplication, order: number, t: (key: string) => string): EducationCard => {
    // Определяем категорию на основе названия приложения
    let category: TabType = 'education';
    
    const name = app.name.toLowerCase().trim();
    
    // Админ панель и ЭЦП - только в категории "Все приложения" (не показываем в других категориях)
    if (name.includes('админ панель') || name.includes('admin panel') || 
        name.includes('эцп') || name.includes('ecp')) {
      category = 'all'; // Специальная категория для отображения только в "Все приложения"
    }
    // Образование: Platonus, Gmail, Lessons
    else if (name.includes('platonus') || name.includes('gmail') || name.includes('lessons')) {
      category = 'education';
    }
    // Наука: Science Journal, Yessenov Science Journal, Bitrix24, Dspace, KPI
    else if (name.includes('science journal') || name.includes('yessenov science journal') || 
             name.includes('bitrix24') || name.includes('bitrix') || 
             name.includes('dspace') || name.includes('kpi')) {
      category = 'science';
    }
    // Воспитание: Student Clubs, Общежитие, Help Desk, Service
    else if (name.includes('student clubs') || name.includes('общежитие') || name.includes('dormitory') || 
             name.includes('help desk') || name.includes('helpdesk') || name.includes('service')) {
      category = 'upbringing';
    }
    // По умолчанию - образование
    else {
      category = 'education';
    }

    return {
      id: `api-${app.id}`,
      title: app.name,
      description: app.description || t('applicationsPage.card.noDescription'),
      image: app.image || '/service.png',
      href: app.url,
      ctaLabel: t('applicationsPage.card.goTo'),
      category: category,
      isActive: true,
      order: order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
};

// Функция для получения переведенного названия и описания приложения
const getTranslatedApplication = (app: ApiApplication, t: (key: string) => string, i18n: { language: string }) => {
  console.log('🔍 Translating app:', app.name, 'Language:', i18n?.language)
  
  // Список известных приложений с их переводами
  const knownApplications: { [key: string]: { titleKey: string, descriptionKey: string } } = {
    'platonus': { titleKey: 'platonus', descriptionKey: 'platonus' },
    'canvas': { titleKey: 'canvas', descriptionKey: 'canvas' },
    'google meet': { titleKey: 'googleMeet', descriptionKey: 'googleMeet' },
    'bitrix24': { titleKey: 'bitrix24', descriptionKey: 'bitrix24' },
    'bitrix': { titleKey: 'bitrix24', descriptionKey: 'bitrix24' },
    'dspace': { titleKey: 'dspace', descriptionKey: 'dspace' },
    'gmail': { titleKey: 'gmail', descriptionKey: 'gmail' },
    'helpdesk': { titleKey: 'helpdesk', descriptionKey: 'helpdesk' },
    'help desk': { titleKey: 'helpdesk', descriptionKey: 'helpdesk' },
    'kpi': { titleKey: 'kpi', descriptionKey: 'kpi' },
    'lessons': { titleKey: 'lessons', descriptionKey: 'lessons' },
    'science journal': { titleKey: 'scienceJournal', descriptionKey: 'scienceJournal' },
    'service': { titleKey: 'service', descriptionKey: 'service' },
    'yessenov science journal': { titleKey: 'yessenovScienceJournal', descriptionKey: 'yessenovScienceJournal' },
    'student clubs': { titleKey: 'studentClubs', descriptionKey: 'studentClubs' },
    'admin panel': { titleKey: 'adminPanel', descriptionKey: 'adminPanel' },
    'админ панель': { titleKey: 'adminPanel', descriptionKey: 'adminPanel' },
    'dormitory': { titleKey: 'dormitory', descriptionKey: 'dormitory' },
    'общежитие': { titleKey: 'dormitory', descriptionKey: 'dormitory' },
    'эцп': { titleKey: 'ecp', descriptionKey: 'ecp' },
    'ecp': { titleKey: 'ecp', descriptionKey: 'ecp' }
  }
  
  // Нормализуем название для поиска
  const normalizedName = app.name.toLowerCase().trim()
  
  // Ищем точное совпадение
  let translationKey = knownApplications[normalizedName]
  
  // Если не найдено, ищем частичное совпадение
  if (!translationKey) {
    for (const [key, value] of Object.entries(knownApplications)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        translationKey = value
        break
      }
    }
  }
  
  // Если перевод найден, используем его
  if (translationKey) {
    const titleKey = `applicationsPage.applications.${translationKey.titleKey}.title`
    const descriptionKey = `applicationsPage.applications.${translationKey.descriptionKey}.description`
    
    const translatedTitle = t(titleKey) || app.name
    const translatedDescription = t(descriptionKey) || app.description || t('applicationsPage.card.noDescription')
    
    console.log('✅ Translation found:', {
      original: app.name,
      translated: translatedTitle,
      titleKey,
      descriptionKey
    })
    
    return {
      title: translatedTitle,
      description: translatedDescription
    }
  }
  
  console.log('❌ No translation found for:', app.name)
  
  // Если перевод не найден, возвращаем оригинальные значения
  return {
    title: app.name,
    description: app.description || t('applicationsPage.card.noDescription')
  }
}

export default function EducationPage() {
  const { t, i18n } = useTranslation('common')
  const { user } = useAuth()
  const [cards, setCards] = useState<EducationCard[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [rawApiData, setRawApiData] = useState<ApiApplication[]>([])
  const [isClient, setIsClient] = useState(false)

  // Функция для создания карточек с переводами
  const createTranslatedCards = (apiData: ApiApplication[]) => {
    return apiData.map((app, index) => {
      const translated = getTranslatedApplication(app, t, i18n)
      
      // Определяем категорию на основе названия приложения
      let category: TabType = 'education'
      
      const name = app.name.toLowerCase().trim()
      
      // Админ панель и ЭЦП - только в категории "Все приложения" (не показываем в других категориях)
      if (name.includes('админ панель') || name.includes('admin panel') || 
          name.includes('эцп') || name.includes('ecp')) {
        category = 'all' // Специальная категория для отображения только в "Все приложения"
      }
      // Образование: Platonus, Gmail, Lessons
      else if (name.includes('platonus') || name.includes('gmail') || name.includes('lessons')) {
        category = 'education'
      }
      // Наука: Science Journal, Yessenov Science Journal, Bitrix24, Dspace, KPI
      else if (name.includes('science journal') || name.includes('yessenov science journal') || 
               name.includes('bitrix24') || name.includes('bitrix') || 
               name.includes('dspace') || name.includes('kpi')) {
        category = 'science'
      }
      // Воспитание: Student Clubs, Общежитие, Help Desk, Service
      else if (name.includes('student clubs') || name.includes('общежитие') || name.includes('dormitory') || 
               name.includes('help desk') || name.includes('helpdesk') || name.includes('service')) {
        category = 'upbringing'
      }
      // По умолчанию - образование
      else {
        category = 'education'
      }

      return {
        id: `api-${app.id}`,
        title: translated.title,
        description: translated.description,
        image: app.image || '/service.png',
        href: app.url || '#',
        ctaLabel: t('applicationsPage.card.goTo'),
        category: category,
        isActive: true,
        order: index + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    })
  }

  // Проверяем, что мы на клиенте
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Загружаем данные при изменении пользователя
  useEffect(() => {
    if (user && isClient) {
      loadCards()
    } else if (!user) {
      setLoading(false)
    }
  }, [user, isClient])

  // Пересоздаем карточки при смене языка
  useEffect(() => {
    if (rawApiData.length > 0 && isClient) {
      const translatedCards = createTranslatedCards(rawApiData)
      setCards(translatedCards)
    }
  }, [i18n.language, rawApiData, t, isClient])

  const loadCards = async () => {
    setLoading(true)
    try {
      // Получаем данные только из API
      const apiApps = await ApplicationsApi.getApplications()
      setRawApiData(apiApps) // Сохраняем сырые данные
      
      // Создаем карточки с переводами
      const translatedCards = createTranslatedCards(apiApps)
      setCards(translatedCards)
      
      console.log('✅ Загружено приложений из API:', translatedCards.length)
    } catch (error) {
      console.error('Ошибка загрузки карточек:', error)
      setCards([])
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = (card: EducationCard) => {
    // Логика отслеживания кликов может быть добавлена позже
    console.log('Card clicked:', card.title);
  }

  // Фильтрация карточек по активному табу
  const filteredCards = activeTab === 'all' 
    ? cards // В "Все приложения" показываем все карточки
    : cards.filter(card => card.category === activeTab) // В других табах показываем только соответствующие категории

  // Получаем название категории для отображения
  const getCategoryName = (category: TabType) => {
    switch (category) {
      case 'education':
        return t('applicationsPage.tabs.education')
      case 'science':
        return t('applicationsPage.tabs.science')
      case 'upbringing':
        return t('applicationsPage.tabs.upbringing')
      default:
        return category
    }
  }

  // Если пользователь не авторизован
  if (!user) {
    return (
      <Layout active={'education'}>
        <div className="applications-page">
          <div className="applications-header">
            <h1 className="applications-title">{t('applicationsPage.title')}</h1>
            <p className="applications-description">{t('applicationsPage.description')}</p>
          </div>
          
          <div className="empty-state">
            <p>{t('applicationsPage.messages.loginRequired')}</p>
            <a href="/login" className="text-blue-600 hover:underline">
              {t('applicationsPage.messages.signIn')}
            </a>
          </div>
        </div>
      </Layout>
    )
  }

  if (loading) {
    return (
      <Layout active={'education'}>
        <div className="applications-page">
          <div className="applications-header">
            <h1 className="applications-title">{t('applicationsPage.title')}</h1>
            <p className="applications-description">{t('applicationsPage.description')}</p>
          </div>
          
          {/* Скелетон табов */}
          <div className="skeleton-tabs">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="skeleton-tab"></div>
            ))}
          </div>
          
          <div className="skeleton-grid">
            {/* Скелетон загрузки */}
            {[...Array(4)].map((_, index) => (
              <div key={index} className="skeleton-card">
                <div className="skeleton-card-header">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-title"></div>
                </div>
                <div className="skeleton-description">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line"></div>
                </div>
                <div className="skeleton-divider"></div>
                <div className="skeleton-link"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout active={'education'}>
      <div className="applications-page">
        <div className="applications-header">
          <h1 className="applications-title">{t('applicationsPage.title')}</h1>
          <p className="applications-description">{t('applicationsPage.description')}</p>
        </div>

        {/* Табы */}
        <div className="applications-tabs">
          <button
            onClick={() => setActiveTab('all')}
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          >
            {t('applicationsPage.tabs.all')}
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`tab-button ${activeTab === 'education' ? 'active' : ''}`}
          >
            {t('applicationsPage.tabs.education')}
          </button>
          <button
            onClick={() => setActiveTab('science')}
            className={`tab-button ${activeTab === 'science' ? 'active' : ''}`}
          >
            {t('applicationsPage.tabs.science')}
          </button>
          <button
            onClick={() => setActiveTab('upbringing')}
            className={`tab-button ${activeTab === 'upbringing' ? 'active' : ''}`}
          >
            {t('applicationsPage.tabs.upbringing')}
          </button>
        </div>

        {/* Сетка карточек */}
        <div className="applications-grid">
          {filteredCards.map((card) => (
            <EduCard
              key={card.id}
              image={card.image}
              title={card.title}
              description={card.description}
              href={card.href}
              ctaLabel={card.ctaLabel}
              onClick={() => handleCardClick(card)}
            />
          ))}
        </div>
        
        {filteredCards.length === 0 && !loading && (
          <div className="empty-state">
            <p>
              {activeTab === 'all' 
                ? t('applicationsPage.messages.noApplications')
                : t('applicationsPage.messages.noApplicationsInCategory', { category: getCategoryName(activeTab) })
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

function EduCard({
  image,
  title,
  description,
  href,
  ctaLabel,
  onClick
}: {
  image: string
  title: string
  description: string
  href: string
  ctaLabel: string
  onClick: () => void
}) {
  // Функция для обрезки текста если он слишком длинный
  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Определяем размер шрифта в зависимости от длины описания
  const getDescriptionClass = (text: string) => {
    if (text.length > 100) return 'card-description text-xs';
    if (text.length > 60) return 'card-description text-sm';
    return 'card-description text-sm';
  };

  return (
    <div className="application-card">
      <div className="card-header">
        <Image
          src={image}
          alt={title}
          width={65}
          height={65}
          className="card-image"
          onError={(e) => {
            // Если изображение не загрузилось, используем дефолтное
            (e.target as HTMLImageElement).src = '/service.png';
          }}
        />
        <p className="card-title">{title}</p>
      </div>

      <p className={getDescriptionClass(description)}>
        {truncateText(description)}
      </p>

      <div className="card-divider" />

      <div className="card-footer">
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className="card-link"
        >
          {ctaLabel} <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  )
}