'use client'

import { ChevronRight } from 'lucide-react'
import Layout from '@/components/Layout'
import Image from 'next/image'
import Link from 'next/link'

export default function EducationPage() {
  return (
    <Layout>
      <h1 className="text-[22px] font-semibold text-gray-800 mb-3">Образование</h1>
      <p className="text-[15px] text-gray-500 mb-5">Доступ ко всем учебным ресурсам и материалам</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
    <div className="bg-white rounded-lg px-5 py-4 shadow-sm flex flex-col justify-between h-52 w-full max-w-full sm:max-w-[290px] lg:max-w-[350px] overflow-hidden">
      <div className="flex items-center gap-4 mb-2">
        <Image
          src={image}
          alt={title}
          width={65}
          height={65}
          className="rounded-[10%]"
        />
        <p className="font-semibold text-[17px]">{title}</p>
      </div>

      <p className="text-[14px] text-gray-500 flex-1 mb-4">{description}</p>

      <div className="border-t border-gray-200 mb-2" />

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
