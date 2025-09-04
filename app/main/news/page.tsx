'use client'

import Layout from '@/components/Layout'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import NewsCard from '@/components/news/NewsCard'
import { Calendar, ExternalLink } from 'lucide-react'
import { useMemo, useEffect, useState } from 'react'
import { newsService } from '@/lib/services/newsService'
import { NewsItem } from '@/lib/types/news'
import { formatDate } from '@/lib/utils/dateUtils'

export default function NewsPage() {
  const { t, i18n } = useTranslation('common')
  const [newsData, setNewsData] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  // Загружаем данные из сервиса
  useEffect(() => {
    // Проверяем, что мы на клиенте
    if (typeof window === 'undefined') return
    
    try {
      const publishedNews = newsService.getPublishedNews()
      setNewsData(publishedNews)
      setLoading(false)
    } catch (error) {
      console.error('Error loading news:', error)
      setLoading(false)
    }
  }, [])

  // Создаем данные с переводами только когда они доступны
  const translatedNewsData = useMemo(() => {
    return newsData.map(item => ({
      id: parseInt(item.id),
      title: i18n.language === 'en' ? item.titleEn : i18n.language === 'kz' ? item.titleKz : item.title,
      description: i18n.language === 'en' ? item.descriptionEn : i18n.language === 'kz' ? item.descriptionKz : item.description,
      date: formatDate(item.publishedAt || item.createdAt),
      category: item.category ? 
        (i18n.language === 'en' ? item.category.nameEn : i18n.language === 'kz' ? item.category.nameKz : item.category.name) : 
        '',
      image: item.image,
      link: `#` // В реальном приложении это будет ссылка на полную новость
    }))
  }, [newsData, i18n.language])

  if (loading) {
    return (
      <Layout active="news">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">{t('news.pageTitle')}</h1>
          <p className="text-gray-500">{t('news.pageDescription')}</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('common.loading') || 'Загрузка новостей...'}</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout active="news">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">{t('news.pageTitle')}</h1>
        <p className="text-gray-500">{t('news.pageDescription')}</p>
      </div>

      {translatedNewsData.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4" />
            <p className="text-lg font-medium">Новости не найдены</p>
            <p className="text-sm">Пока нет опубликованных новостей</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {translatedNewsData.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <a 
              href="https://yu.edu.kz/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>{t('news.viewAll')}</span>
              <ExternalLink size={16} />
            </a>
          </div>
        </>
      )}
    </Layout>
  )
}