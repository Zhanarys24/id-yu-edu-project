'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const news = [
  {
    image: '/news-esenov.png',
    date: '25 июля 2025',
    title: 'Открытие нового корпуса',
    slug: 'new-building',
  },
  {
    image: '/news-esenov.png',
    date: '20 июля 2025',
    title: 'Научная конференция',
    slug: 'conference',
  },
  {
    image: '/news-esenov.png',
    date: '18 июля 2025',
    title: 'Волонтёрская ярмарка',
    slug: 'volunteering',
  },
  {
    image: '/news-esenov.png',
    date: '16 июля 2025',
    title: 'Летняя школа',
    slug: 'summer-school',
  },
]

export default function NewsSlider() {
  const [items, setItems] = useState(news)

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => {
        const newItems = [...prev.slice(1), prev[0]]
        return newItems
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full flex justify-center py-6 bg-gray-50 overflow-hidden">
      {/* 📱 Горизонтальный скролл на мобильных */}
      <div className="sm:hidden flex gap-4 overflow-x-auto px-4 scrollbar-hide scroll-smooth w-full">
        {items.map((card, index) => (
          <Card key={index} {...card} width={220} height={280} />
        ))}
      </div>

      {/* 💻 Обычная анимация на sm+ */}
      <div className="hidden sm:block relative w-full max-w-[900px] h-[400px] sm:h-[350px] xs:h-[300px] overflow-hidden bg-gray-100 rounded-xl shadow-inner px-2">
        <div className="flex items-center h-full transition-all duration-700 ease-in-out translate-x-[-60px] sm:translate-x-[-30px] xs:translate-x-[-15px]">
          {items.map((card, index) => {
            const isMain = index === 1
            const width = isMain ? 250 : 220
            const height = isMain ? 310 : 280

            return index < 4 ? (
              <Card key={index} {...card} width={width} height={height} />
            ) : null
          })}
        </div>
      </div>
    </div>
  )
}

function Card({
  image,
  date,
  title,
  slug,
  width,
  height,
}: {
  image: string
  date: string
  title: string
  slug: string
  width: number
  height: number
}) {
  return (
    <Link href={`/news/${slug}`}>
      <div
        className="relative bg-white rounded-lg shadow-inner border border-gray-200 overflow-hidden shrink-0 mx-[10px] transition-all duration-700 cursor-pointer hover:scale-[1.02]"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <div className="relative w-full" style={{ height: `${height * 0.75}px` }}>
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-3 h-[25%] flex flex-col justify-center">
          <p className="text-xs text-gray-400">{date}</p>
          <h2 className="text-sm font-semibold text-gray-800 truncate">{title}</h2>
        </div>
      </div>
    </Link>
  )
}
