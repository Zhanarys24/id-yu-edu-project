'use client'

import { ChevronRight } from 'lucide-react'
import Layout from '@/components/Layout'
import Image from 'next/image'
import Link from 'next/link'

// Главная страница раздела "Воспитание"
export default function VospitaniePage() {
  return (
    // Основной макет страницы с активной вкладкой "Воспитание"
    <Layout active="Воспитание">

      {/* Заголовок и подзаголовок страницы */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">Воспитание</h1>
      <p className="text-gray-500 mb-6">Заявки на общежитие, секции, клубы</p>

      {/* Сетка с карточками: Кураторство и Воспитательные мероприятия */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EduCard
          image="/YSJ.png"
          overlay="/dormitory-logo.png"
          title="Кураторство"
          description="Инструменты для работы с кураторами и студентами"
          href="/curators"
        />
        <EduCard
          image="/YSJ.png"
          overlay="/studentclubs-logo.png"
          title="Воспитательные мероприятия"
          description="Планирование и отчётность воспитательных мероприятий"
          href="/events"
        />
      </div>
    </Layout>
  )
}

// Компонент карточки для перехода в определённый раздел
function EduCard({
  image,
  overlay,
  title,
  description,
  href,
}: {
  image: string        // Основное изображение (фон)
  overlay?: string     // Наложение поверх (иконка)
  title: string        // Название раздела
  description: string  // Краткое описание
  href: string         // Ссылка перехода
}) {
  return (
    // Обёртка карточки
    <div className="bg-white rounded-lg px-4 py-3 shadow-sm flex flex-col justify-between h-44 w-full max-w-full sm:max-w-[260px] lg:max-w-[320px] overflow-hidden">
      
      {/* Верхняя часть: иконка + заголовок + описание */}
      <div>
        {/* Иконка и заголовок */}
        <div className="flex items-center gap-3 mb-2 relative">
          <div className="relative w-10 h-10">
            {/* Основное изображение */}
            <Image src={image} alt={title} fill className="object-contain" />
            
            {/* Наложенная иконка поверх (если есть) */}
            {overlay && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Image
                  src={overlay}
                  alt="Overlay"
                  width={20}
                  height={20}
                />
              </div>
            )}
          </div>

          {/* Заголовок карточки */}
          <p className="font-semibold text-base">{title}</p>
        </div>

        {/* Описание карточки */}
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      {/* Разделительная линия */}
      <div className="border-t border-gray-200 my-3" />

      {/* Нижняя часть: кнопка перехода */}
      <div className="text-right">
        <Link
          href={href}
          className="text-sm text-blue-600 font-medium hover:underline whitespace-nowrap inline-flex items-center gap-1"
        >
          Войти <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  )
}