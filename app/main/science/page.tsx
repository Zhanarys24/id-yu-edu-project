'use client'

import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import Layout from '@/components/Layout'
import Image from 'next/image'
import Link from 'next/link'

export default function SciencePage() {
  const { t } = useTranslation('common')
  return (
    <Layout active="science">
      <h1 className="text-[22px] font-semibold text-gray-800 mb-3">{t('science.title')}</h1>
      <p className="text-[15px] text-gray-500 mb-5">{t('science.subtitle')}</p>

      {/* Адаптивная сетка */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6">
        <EduCard
          image="/OJS.png"
          overlayImage="/OJS-logo.png"
          title="OJS"
          description={t('science.ojsDesc')}
          href="https://pkp.sfu.ca/ojs/"
          ctaLabel={t('education.sign_in')}
        />
        <EduCard
          image="/Dspace.png"
          overlayImage="/Dspace-logo.png"
          title="Dspace"
          description={t('science.dspaceDesc')}
          href="https://dspace.ly"
          ctaLabel={t('education.sign_in')}
        />
        <EduCard
          image="/YSJ.png"
          overlayImage="/YSJ-logo.png"
          title="YSJ"
          description={t('science.ysjDesc')}
          href="/ysj"
          ctaLabel={t('education.sign_in')}
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
  ctaLabel,
}: {
  image: string
  overlayImage?: string
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
        overflow-hidden transition-transform
      "
    >
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-3">
          <div className="relative w-17 h-17">
            <Image src={image} alt={title} fill className="object-contain" />
            {overlayImage && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Image src={overlayImage} alt="Overlay" width={55} height={55} />
              </div>
            )}
          </div>
          <p className="font-semibold text-[17px]">{title}</p>
        </div>
        <p className="text-[14px] text-gray-500 line-clamp-3">{description}</p>
      </div>

      <div>
        <div className="border-t border-gray-200 mt-4 mb-2" />
        <div className="text-right">
          <Link
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="text-sm text-blue-600 font-medium hover:underline whitespace-nowrap inline-flex items-center gap-1"
          >
            {ctaLabel} <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
