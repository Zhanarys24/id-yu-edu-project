'use client'

import { ChevronRight } from 'lucide-react'
import Layout from '@/components/Layout'
import Image from 'next/image'
import Link from 'next/link'

// Главная страница раздела "Воспитание"
export default function VospitaniePage() {
  return (
    <Layout active="Воспитание">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">Воспитание</h1>
      <p className="text-gray-500 mb-6">Заявки на общежитие, секции, клубы</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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

// Компонент карточки
function EduCard({
  image,
  overlay,
  title,
  description,
  href,
}: {
  image: string
  overlay?: string
  title: string
  description: string
  href: string
}) {
  return (
    <div className="bg-white rounded-lg px-5 py-4 shadow-sm flex flex-col justify-between h-52 w-full max-w-full sm:max-w-[290px] lg:max-w-[340px] overflow-hidden">
      <div>
        <div className="flex items-center gap-3 mb-2 relative">
          <div className="relative w-17 h-17">
            <Image src={image} alt={title} fill className="object-contain" />
            {overlay && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Image src={overlay} alt="Overlay" width={55} height={55} />
              </div>
            )}
          </div>
          <p className="font-semibold text-base">{title}</p>
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <div className="border-t border-gray-200 my-3" />

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
