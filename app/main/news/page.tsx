'use client'

import Layout from '@/components/Layout'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import NewsCard from '@/components/news/NewsCard'
import { Calendar, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { yuNewsService } from '@/lib/services/yuNewsService'

interface NewsCardItem {
  id: number
  title: string
  date: string
  image: string
  link?: string
}

export default function NewsPage() {
  const { t, i18n } = useTranslation('common')
  const [newsData, setNewsData] = useState<NewsCardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    try {
      setLoading(true)
      setError(null)
      const yuNews = await yuNewsService.getLatestNews()
      
      // Преобразуем YU новости в простой формат для NewsCard
      const convertedNews: NewsCardItem[] = yuNews.map((yuNewsItem, index) => ({
        id: index + 1, // Простой числовой ID
        title: yuNewsItem.title,
        date: yuNewsItem.date,
        image: yuNewsItem.image,
        link: yuNewsItem.link
      }))
      
      setNewsData(convertedNews)
    } catch (err) {
      console.error('Error loading news:', err)
      setError('Ошибка загрузки новостей')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout active="news">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          {t('news.title')}
        </h1>
        <p className="text-gray-500">
          {t('news.description')}
        </p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">{t('news.loading')}</span>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={loadNews}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t('news.retry')}
          </button>
        </div>
      )}

      {!loading && !error && newsData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4" />
            <p className="text-lg font-medium">{t('news.notFound')}</p>
            <p className="text-sm">{t('news.retry')}</p>
          </div>
        </div>
      )}

      {!loading && !error && newsData.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {newsData.map((news) => (
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