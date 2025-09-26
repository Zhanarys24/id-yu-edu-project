'use client'

import Image from 'next/image'
import { Calendar, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { newsService } from '@/lib/services/newsService'
import { RegisteredUser } from '@/lib/types/user'
import { UserRole } from '@/lib/types/auth'
import '@/i18n'

interface NewsItem {
  id: number
  title: string
  date: string
  image: string
  link?: string
}

interface NewsCardProps {
  news: NewsItem
}

export default function NewsCard({ news }: NewsCardProps) {
  const { t } = useTranslation('common')
  const { user } = useAuth()

  const handleClick = () => {
    if (user && user.role !== 'anonymous') {
      try {
        // Создаем объект пользователя для отслеживания
        const userForTracking: RegisteredUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          position: user.position,
          role: user.role as UserRole,
          registeredAt: new Date().toISOString(),
          isActive: true,
          passwordHash: '',
          isTemporaryPassword: false
        }
        
        // Отслеживаем клик
        newsService.trackNewsClick(
          news.id.toString(),
          userForTracking,
          navigator.userAgent,
          '127.0.0.1' // В реальном приложении получать IP с сервера
        )
      } catch (error) {
        console.error('Error tracking news click:', error)
      }
    }
  }

  // Функция для нормализации URL изображения
  const getImageSrc = (imageUrl: string) => {
    if (!imageUrl) return '/avatar.jpg' // fallback изображение
    
    // Если это относительный путь, добавляем ведущий слеш
    if (imageUrl.startsWith('/')) {
      return imageUrl
    }
    
    // Если это полный URL, возвращаем как есть
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }
    
    // Если это просто имя файла, добавляем путь к публичной папке
    if (imageUrl.includes('.')) {
      return `/${imageUrl}`
    }
    
    // Fallback
    return '/avatar.jpg'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="relative h-40">
        {news.image ? (
          <Image
            src={getImageSrc(news.image)}
            alt={news.title}
            fill
            className="object-cover"
            onError={(e) => {
              // Если изображение не загружается, показываем fallback
              const target = e.target as HTMLImageElement
              target.src = '/avatar.jpg'
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Нет изображения</span>
          </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2 mt-2">
          <Calendar size={12} />
          <span>{news.date}</span>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-3 line-clamp-3 leading-tight text-sm flex-grow">
          {news.title}
        </h3>
        
        <div className="mt-auto pt-2 border-t border-gray-100">
          {news.link ? (
            <a 
              href={news.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="inline-flex items-center gap-1.5 text-blue-600 text-xs font-medium hover:text-blue-700 transition-colors"
            >
              <span>{t('news.readMore')}</span>
              <ExternalLink size={12} />
            </a>
          ) : (
            <button
              onClick={handleClick}
              className="inline-flex items-center gap-1.5 text-blue-600 text-xs font-medium hover:text-blue-700 transition-colors"
            >
              <span>{t('news.readMore')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}