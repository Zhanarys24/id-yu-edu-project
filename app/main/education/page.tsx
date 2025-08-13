'use client'

import { ChevronRight } from 'lucide-react'
import Layout from '@/components/Layout'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import '@/i18n'

export default function EducationPage() {
  const { t } = useTranslation('common')

  return (
    <Layout active={'education'}>
      <h1 className="text-[22px] font-semibold text-gray-800 mb-3">{t('education.education')}</h1>
      <p className="text-[15px] text-gray-500 mb-5">{t('education.education_desc')}</p>

      {/* Адаптивная сетка */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6">
        <EduCard
          image="/canvas.png"
          title={t('education.canvas')}
          description={t('education.education_desc')}
          href="https://canvas.instructure.com"
          ctaLabel={t('education.sign_in')}
        />
        <EduCard
          image="/platonus.png"
          title={t('education.platonus')}
          description={t('education.platonus_desc')}
          href="https://platonus.kz"
          ctaLabel={t('education.sign_in')}
        />
        <EduCard
          image="/lessons.png"
          title="lessons"
          description={t('education.lessons_desc')}
          href="https://meet.google.com"
          ctaLabel={t('education.sign_in')}
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
  ctaLabel,
}: {
  image: string
  title: string
  description: string
  href: string
  ctaLabel: string
}) {
  return (
    <div
      className="
        bg-white rounded-lg px-5 py-4 shadow-sm flex flex-col justify-between h-52
        w-full max-w-full sm:max-w-[300px] lg:max-w-[420px] xl:max-w-[350px]
        overflow-hidden transition-transform
      "
    >
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
          {ctaLabel} <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  )
}
