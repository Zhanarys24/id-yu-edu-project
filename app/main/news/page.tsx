'use client'

import Layout from '@/components/Layout'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import NewsCard from '@/components/news/NewsCard'
import { Calendar, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { newsService } from '@/lib/services/newsService'
import { NewsItem } from '@/lib/types/news'
import { formatDate } from '@/lib/utils/dateUtils'

export default function NewsPage() {
  const { t, i18n } = useTranslation('common')
  const [newsData, setNewsData] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = () => {
    try {
      // Получаем только опубликованные новости
      const publishedNews = newsService.getPublishedNews()
      setNewsData(publishedNews)
    } catch (error) {
      console.error('Error loading news:', error)
    } finally {
      setLoading(false)
    }
  }

  // Преобразуем данные NewsItem в формат, ожидаемый NewsCard
  const transformedNewsData = newsData.map(news => ({
    id: parseInt(news.id),
    title: news.title,
    description: news.description,
    date: formatDate(news.publishedAt || news.createdAt),
    category: news.category?.name || 'Без категории',
    image: news.image,
    link: news.link
  }))

  return (
    <Layout active="news">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">{t('news.pageTitle')}</h1>
        <p className="text-gray-500">{t('news.pageDescription')}</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Загрузка новостей...</span>
        </div>
      ) : transformedNewsData.length === 0 ? (
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
            {transformedNewsData.map((news) => (
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