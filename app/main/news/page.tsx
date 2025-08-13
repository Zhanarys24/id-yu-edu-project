'use client'

import Layout from '@/components/Layout'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import NewsCard from '@/components/news/NewsCard'
import { Calendar, ExternalLink } from 'lucide-react'
import { useMemo } from 'react'

export default function NewsPage() {
  const { t, i18n } = useTranslation('common')

  // Базовые данные новостей (без переводов)
  const baseNewsData = [
    {
      id: 1,
      date: '01.07.2025',
      categoryKey: 'rating',
      image: '/qs.jpeg',
      link: 'https://yu.edu.kz/qs-world-university-rankings-2026-n%d3%99tizheleri/'
    },
    {
      id: 2,
      date: '01.07.2025',
      categoryKey: 'international',
      image: '/Az.jpeg',
      link: 'https://yu.edu.kz/kini-zh%d3%99ne-dku-%d3%a9kilderinin-birlesken-otyrysy-2/'
    },
    {
      id: 3,
      date: '01.07.2025',
      categoryKey: 'science',
      image: '/kini.jpeg',
      link: 'https://yu.edu.kz/kini-zh%d3%99ne-dku-%d3%a9kilderinin-birlesken-otyrysy/'
    },
    {
      id: 4,
      date: '01.07.2025',
      categoryKey: 'management',
      image: '/korup.jpeg',
      link: 'https://yu.edu.kz/sybajlas-zhemqorlyqqa-qarsy-menedzhment-zh%d2%afjesi/'
    },
    {
      id: 5,
      date: '30.06.2025',
      categoryKey: 'cooperation',
      image: '/coest.jpeg',
      link: 'https://yu.edu.kz/coest-delegacziyasymen-kezdesu/'
    },
    {
      id: 6,
      date: '24.06.2025',
      categoryKey: 'opening',
      image: '/Aqkenjeev.jpeg',
      link: 'https://yu.edu.kz/shynabaj-aqkenzheevtin-atynda%d2%93y-auditoriyanyn-ashyluy-2/'
    },
    {
      id: 7,
      date: '03.06.2025',
      categoryKey: 'achievements',
      image: '/students_inter.jpg',
      link: 'https://yu.edu.kz/qazaqstandyq-studentter-zha%d2%bbandyq-bajqauda-zheniske-zhetti/'
    },
    {
      id: 8,
      date: '19.11.2025',
      categoryKey: 'olympiad',
      image: '/olimpiada.jpg',
      link: 'https://yu.edu.kz/ru/xvii-respublikalyq-p%D3%99ndik-olimpiadasy-ii-kezeni-%D3%A9tedi/'
    }
  ]

  // Создаем данные с переводами только когда они доступны
  const newsData = useMemo(() => {
    return baseNewsData.map(item => ({
      ...item,
      title: t(`news.items.${item.id}.title`),
      description: t(`news.items.${item.id}.description`),
      category: t(`news.categories.${item.categoryKey}`)
    }))
  }, [i18n.language]) // Пересоздавать массив при смене языка

  return (
    <Layout active="news">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">{t('news.pageTitle')}</h1>
        <p className="text-gray-500">{t('news.pageDescription')}</p>
      </div>

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
    </Layout>
  )
}