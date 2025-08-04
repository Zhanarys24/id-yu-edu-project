'use client'

import { ChevronRight } from 'lucide-react'
import Layout from '@/components/Layout'
import Image from 'next/image'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <Layout>
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">Образование</h1>
      <p className="text-gray-500 mb-6">Доступ ко всем учебным ресурсам и материалам</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EduCard
          image="/canvas.png"
          title="Canvas"
          description="Доступ к курсам и заданиям"
          href="https://canvas.instructure.com"
        />
        <EduCard
          image="/platonus.png"
          title="Platonus"
          description="Система для автоматизации учебного процесса"
          href="https://platonus.kz"
        />
        <EduCard
          image="/lessons.png"
          title="Lessons"
          description="Проведение видеоконференций с помощью Google Meet"
          href="https://meet.google.com"
        />
      </div>
    </Layout>
  )
}

function EduCard({
  image,
  title,
  description,
  href,
}: {
  image: string
  title: string
  description: string
  href: string
}) {
  return (
    <div className="bg-white rounded-lg px-4 py-3 shadow-sm flex flex-col justify-between h-44 w-full max-w-full sm:max-w-[260px] lg:max-w-[320px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Image src={image} alt={title} width={40} height={40} />
        <p className="font-semibold text-base">{title}</p>
      </div>

      {/* Body */}
      <p className="text-sm text-gray-500 flex-1 mb-3">{description}</p>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-2" />

      {/* Footer */}
      <div className="text-right">
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 font-medium hover:underline whitespace-nowrap inline-flex items-center gap-1"
        >
          Войти <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  )
}
