'use client'

import { ChevronRight } from 'lucide-react'
import Layout from '@/components/Layout'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import '@/i18n'

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

  convertToEducationCard: (app: ApiApplication, order: number): EducationCard => {
    // Определяем категорию на основе названия или описания
    let category: TabType = 'education';
    
    const name = app.name.toLowerCase();
    const description = (app.description || '').toLowerCase();
    
    if (name.includes('наука') || name.includes('science') || name.includes('journal') || 
        description.includes('наука') || description.includes('science')) {
      category = 'science';
    } else if (name.includes('воспитание') || name.includes('upbringing') || 
               description.includes('воспитание') || description.includes('upbringing')) {
      category = 'upbringing';
    } else {
      category = 'education';
    }

    return {
      id: `api-${app.id}`,
      title: app.name,
      description: app.description || 'Описание не указано',
      image: app.image || '/service.png',
      href: app.url,
      ctaLabel: 'Перейти',
      category: category,
      isActive: true,
      order: order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
};

export default function EducationPage() {
  const { t } = useTranslation('common')
  const { user } = useAuth()
  const [cards, setCards] = useState<EducationCard[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('all')

  useEffect(() => {
    // Проверяем авторизацию перед загрузкой
    if (user) {
      loadCards()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadCards = async () => {
    setLoading(true)
    try {
      // Получаем данные только из API
      const apiApps = await ApplicationsApi.getApplications()
      
      // Преобразуем API данные в карточки
      const apiCards = apiApps.map((app, index) => 
        ApplicationsApi.convertToEducationCard(app, index + 1)
      )
      setCards(apiCards)
      console.log('✅ Загружено приложений из API:', apiCards.length)
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
    ? cards 
    : cards.filter(card => card.category === activeTab)

  // Если пользователь не авторизован
  if (!user) {
    return (
      <Layout active={'education'}>
        <h1 className="text-[22px] font-semibold text-gray-800 mb-3">{t('education.education')}</h1>
        <p className="text-[15px] text-gray-500 mb-5">{t('education.education_desc')}</p>
        
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Для доступа к приложениям необходимо авторизоваться</p>
          <a href="/login" className="text-blue-600 hover:underline">
            Войти в систему
          </a>
        </div>
      </Layout>
    )
  }

  if (loading) {
    return (
      <Layout active={'education'}>
        <h1 className="text-[22px] font-semibold text-gray-800 mb-3">{t('education.education')}</h1>
        <p className="text-[15px] text-gray-500 mb-5">{t('education.education_desc')}</p>
        
        {/* Скелетон табов */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="px-4 py-2 bg-gray-200 rounded-md animate-pulse w-24 h-8"></div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6">
          {/* Скелетон загрузки */}
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg px-5 py-4 shadow-sm h-52 animate-pulse">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                <div className="w-32 h-5 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="w-full h-4 bg-gray-300 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
              </div>
              <div className="border-t border-gray-200 mb-2" />
              <div className="w-20 h-4 bg-gray-300 rounded ml-auto"></div>
            </div>
          ))}
        </div>
      </Layout>
    )
  }

  return (
    <Layout active={'education'}>
      <h1 className="text-[22px] font-semibold text-gray-800 mb-3">{t('education.education')}</h1>
      <p className="text-[15px] text-gray-500 mb-5">{t('education.education_desc')}</p>

      {/* Табы */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Все приложения
        </button>
        <button
          onClick={() => setActiveTab('education')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'education'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Образование
        </button>
        <button
          onClick={() => setActiveTab('science')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'science'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Наука
        </button>
        <button
          onClick={() => setActiveTab('upbringing')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'upbringing'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Воспитание
        </button>
      </div>

      {/* Адаптивная сетка */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6">
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
        <div className="text-center py-12">
          <p className="text-gray-500">
            {activeTab === 'all' 
              ? 'Приложения не найдены' 
              : `Приложения в категории "${activeTab === 'education' ? 'Образование' : activeTab === 'science' ? 'Наука' : 'Воспитание'}" не найдены`
            }
          </p>
        </div>
      )}
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
    if (text.length > 100) return 'text-xs text-gray-500 flex-1 mb-4';
    if (text.length > 60) return 'text-sm text-gray-500 flex-1 mb-4';
    return 'text-sm text-gray-500 flex-1 mb-4';
  };

  return (
    <div
      className="
        bg-white rounded-lg px-5 py-4 shadow-sm flex flex-col justify-between h-52
        w-full max-w-full sm:max-w-[300px] lg:max-w-[420px] xl:max-w-[350px]
        overflow-hidden transition-transform hover:shadow-md
      "
    >
      <div className="flex items-center gap-4 mb-2">
        <Image
          src={image}
          alt={title}
          width={65}
          height={65}
          className="rounded-[10%] flex-shrink-0"
          onError={(e) => {
            // Если изображение не загрузилось, используем дефолтное
            (e.target as HTMLImageElement).src = '/service.png';
          }}
        />
        <p className="font-semibold text-[17px] leading-tight">{title}</p>
      </div>

      <p className={getDescriptionClass(description)}>
        {truncateText(description)}
      </p>

      <div className="border-t border-gray-200 mb-2" />

      <div className="text-right">
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className="text-sm text-blue-600 font-medium hover:underline whitespace-nowrap inline-flex items-center gap-1"
        >
          {ctaLabel} <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  )
}