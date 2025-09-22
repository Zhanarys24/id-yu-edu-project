'use client'

import { ChevronRight } from 'lucide-react'
import Layout from '@/components/Layout'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { educationService } from '@/lib/services/educationService'
import { useEffect, useState } from 'react'
import { EducationCard } from '@/lib/types/education'
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
      console.warn('Ошибка при получении приложений из API, используем локальные данные:', error);
      return [];
    }
  },

  convertToEducationCard: (app: ApiApplication, order: number): EducationCard => {
    return {
      id: `api-${app.id}`,
      title: app.name,
      description: app.description || 'Описание не указано',
      image: app.image || '/service.png',
      href: app.url,
      ctaLabel: 'Перейти',
      category: 'education',
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

  useEffect(() => {
    loadCards()
  }, [])

  const loadCards = async () => {
    setLoading(true)
    try {
      // Получаем данные из API
      const apiApps = await ApplicationsApi.getApplications()
      
      if (apiApps.length > 0) {
        // Преобразуем API данные в карточки
        const apiCards = apiApps.map((app, index) => 
          ApplicationsApi.convertToEducationCard(app, index + 1)
        )
        setCards(apiCards)
        console.log('✅ Загружено приложений из API:', apiCards.length)
      } else {
        // Если нет данных из API, используем локальные данные
        const educationCards = educationService.getCardsByCategory('education')
        setCards(educationCards.filter(card => card.isActive).sort((a, b) => a.order - b.order))
        console.log('⚠️ Используем локальные данные')
      }
    } catch (error) {
      console.error('Ошибка загрузки карточек:', error)
      // В случае ошибки используем локальные данные
      const educationCards = educationService.getCardsByCategory('education')
      setCards(educationCards.filter(card => card.isActive).sort((a, b) => a.order - b.order))
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = (card: EducationCard) => {
    if (user) {
      educationService.trackClick(card.id, user.id, user.email, user.name)
    }
  }

  if (loading) {
    return (
      <Layout active={'education'}>
        <h1 className="text-[22px] font-semibold text-gray-800 mb-3">{t('education.education')}</h1>
        <p className="text-[15px] text-gray-500 mb-5">{t('education.education_desc')}</p>
        
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

      {/* Адаптивная сетка */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6">
        {cards.map((card) => (
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
      
      {cards.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Приложения не найдены</p>
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
          className="rounded-[10%]"
          onError={(e) => {
            // Если изображение не загрузилось, используем дефолтное
            (e.target as HTMLImageElement).src = '/service.png';
          }}
        />
        <p className="font-semibold text-[17px]">{title}</p>
      </div>

      <p className="text-[14px] text-gray-500 flex-1 mb-4">{description}</p>

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
