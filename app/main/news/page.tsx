'use client'

import Layout from '@/components/Layout'
import NewsSlider from '@/components/news/NewsSlider'
import NewsPost from '@/components/news/NewsPost'

const mockNews = [
  {
    title: 'Открытие нового корпуса',
    image: '/news-esenov.png',
    description: 'В университете открылся новый корпус с современными лабораториями и новыми аудиторными помещениями для студентов естественнонаучного направления.',
    date: '2025-07-25',
  },
  {
    title: 'Научная конференция',
    image: '/news2.jpg',
    description: 'Студенты и преподаватели приняли участие в международной научной конференции, представив уникальные исследования в области экологии, ИИ и инженерии.',
    date: '2025-07-20',
  },
  {
    title: 'Волонтёрская ярмарка',
    image: '/news3.jpg',
    description: 'В Yessenov University прошла ярмарка волонтёрских организаций, где каждый студент мог найти возможность помочь обществу и развить свои навыки.',
    date: '2025-07-18',
  },
]

export default function NewsPage() {
  return (
    <Layout active="Новости">
      {/* Слайдер можно оставить вверху */}
      <NewsSlider />

      <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Новости</h1>

      <div className="flex flex-col items-center">
        {mockNews.map((news, idx) => (
          <NewsPost key={idx} {...news} />
        ))}
      </div>
    </Layout>
  )
}
