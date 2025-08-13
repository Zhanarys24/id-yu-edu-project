'use client'

import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import Layout from '@/components/Layout'
import Image from 'next/image'
import Link from 'next/link'

// Главная страница раздела "Воспитание"
export default function VospitaniePage() {
  const { t } = useTranslation('common')
  return (
    <Layout active="upbringing">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">{t('upbringing.title')}</h1>
      <p className="text-gray-500 mb-6">{t('upbringing.subtitle')}</p>

      {/* Адаптивная сетка */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6">
        <EduCard
          image="/YSJ.png"
          overlay="/dormitory-logo.png"
          title="Dormitory"
          description={t('upbringing.curatorship.desc')}
          href="/curators"
          ctaLabel={t('education.sign_in')}
        />
        <EduCard
          image="/YSJ.png"
          overlay="/studentclubs-logo.png"
          title="Studentclubs"
          description={t('upbringing.events.desc')}
          href="/events"
          ctaLabel={t('education.sign_in')}
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
  ctaLabel,
}: {
  image: string
  overlay?: string
  title: string
  description: string
  href: string
  ctaLabel: string
}) {
  return (
    <div
      className="
        bg-white rounded-lg px-5 py-4 shadow-sm flex flex-col justify-between h-52 
        w-full max-w-full sm:max-w-[300px] lg:max-w-[420px] xl:max-w-[340px] 
        overflow-hidden
      "
    >
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
          {ctaLabel} <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  )
}
