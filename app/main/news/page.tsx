'use client'

import Layout from '@/components/Layout'
import NewsCard from '@/components/news/NewsCard'
import { Calendar, ExternalLink } from 'lucide-react'

const newsData = [
  {
    id: 1,
    title: 'Результаты рейтинга QS World University Rankings 2026',
    description: 'Каспийский государственный университет технологий и инжиниринга имени Ш. Есенова показал высокие результаты в рейтинге QS World University Rankings 2026.',
    date: '01.07.2025',
    category: 'Рейтинг',
    image: '/qs.jpeg',
    link: 'https://yu.edu.kz/qs-world-university-rankings-2026-n%d3%99tizheleri/'
  },
  {
    id: 2,
    title: 'Азербайджан и Казахстан: Укрепление связей в Год Конституции и Суверенитета',
    description: 'Университет реализует совместные проекты по укреплению академических и культурных связей между Азербайджаном и Казахстаном.',
    date: '01.07.2025',
    category: 'Международное сотрудничество',
    image: '/Az.jpeg',
    link: 'https://yu.edu.kz/kini-zh%d3%99ne-dku-%d3%a9kilderinin-birlesken-otyrysy-2/'
  },
  {
    id: 3,
    title: 'Совместная встреча представителей KINI и DKU',
    description: 'Обсуждены вопросы научного сотрудничества между Каспийским международным университетом и Университетом Кораллы Дании.',
    date: '01.07.2025',
    category: 'Научное сотрудничество',
    image: '/kini.jpeg',
    link: 'https://yu.edu.kz/kini-zh%d3%99ne-dku-%d3%a9kilderinin-birlesken-otyrysy/'
  },
  {
    id: 4,
    title: 'Система антикоррупционного менеджмента',
    description: 'В университете внедрена новая система менеджмента по борьбе с коррупцией, обсуждена её эффективность.',
    date: '01.07.2025',
    category: 'Управление',
    image: '/korup.jpeg',
    link: 'https://yu.edu.kz/sybajlas-zhemqorlyqqa-qarsy-menedzhment-zh%d2%afjesi/'
  },
  {
    id: 5,
    title: 'Встреча с делегацией COEST',
    description: 'Между руководством университета и делегацией COEST прошли переговоры по будущему сотрудничеству и совместным проектам.',
    date: '30.06.2025',
    category: 'Сотрудничество',
    image: '/coest.jpeg',
    link: 'https://yu.edu.kz/coest-delegacziyasymen-kezdesu/'
  },
  {
    id: 6,
    title: 'Открытие аудитории имени Шынабая Аккенжеева',
    description: 'В университете торжественно открыли новую аудиторию, названную в честь известного казахстанского ученого Шынабая Аккенжеева.',
    date: '24.06.2025',
    category: 'Открытие',
    image: '/Aqkenjeev.jpeg',
    link: 'https://yu.edu.kz/shynabaj-aqkenzheevtin-atynda%d2%93y-auditoriyanyn-ashyluy-2/'
  },
  {
    id: 7,
    title: 'Казахстанские студенты победили на мировом конкурсе!',
    description: 'Студенты Yessenov University одержали победу в международном технологическом конкурсе, повысив престиж университета.',
    date: '03.06.2025',
    category: 'Достижения',
    image: '/students_inter.jpg',
    link: 'https://yu.edu.kz/qazaqstandyq-studentter-zha%d2%bbandyq-bajqauda-zheniske-zhetti/'
  },
  {
    id: 8,
    title: 'XVII Республиканская предметная олимпиада',
    description: 'Во втором этапе XVII Республиканской предметной олимпиады, прошедшем в университете, студенты продемонстрировали свои знания.',
    date: '19.11.2025',
    category: 'Олимпиада',
    image: '/olimpiada.jpg',
    link: 'https://yu.edu.kz/ru/xvii-respublikalyq-p%D3%99ndik-olimpiadasy-ii-kezeni-%D3%A9tedi/'
  }

]

export default function NewsPage() {
  return (
    <Layout active="Новости">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Новости</h1>
        <p className="text-gray-500">Последние новости и события университета</p>
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
          <span>Посмотреть все новости</span>
          <ExternalLink size={16} />
        </a>
      </div>
    </Layout>
  )
}
