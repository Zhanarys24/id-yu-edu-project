'use client'
import { ChevronRight } from 'lucide-react'
import Layout from '@/components/Layout'
import Image from 'next/image'
import Link from 'next/link'

export default function SciencePage() {
  return (
    <Layout active="Наука">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">Наука</h1>
      <p className="text-gray-500 mb-6">Платформы для исследований, публикаций и проектов</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EduCard
          image="/OJS.png"
          overlayImage="/OJS-logo.png"
          title="OJS"
          description="Управление научными журналами"
          href="https://pkp.sfu.ca/ojs/"
        />
        <EduCard
          image="/Dspace.png"
          overlayImage="/Dspace-logo.png"
          title="Dspace"
          description="Электронный архив диссертаций и исследований"
          href="https://dspace.ly"
        />
        <EduCard
          image="/YSJ.png"
          overlayImage="/YSJ-logo.png"
          title="YSJ"
          description="Публикация университетских работ"
          href="/ysj"
        />
      </div>
    </Layout>
  )
}

function EduCard({
  image,
  overlayImage,
  title,
  description,
  href,
}: {
  image: string
  overlayImage?: string
  title: string
  description: string
  href: string
}) {
  return (
    <div className="bg-white rounded-lg px-4 py-3 shadow-sm flex flex-col justify-between h-44 w-full max-w-full sm:max-w-[260px] lg:max-w-[320px] overflow-hidden">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="relative w-10 h-10">
            <Image src={image} alt={title} fill className="object-contain" />
            {overlayImage && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Image src={overlayImage} alt="Overlay" width={30} height={30} />
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
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="text-sm text-blue-600 font-medium hover:underline whitespace-nowrap inline-flex items-center gap-1"
        >
          Войти <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  )
}
