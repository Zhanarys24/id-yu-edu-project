'use client'

import { Suspense, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import { useSearchParams, useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import clsx from 'clsx'

function PortfolioContent() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const router = useRouter()

  const defaultTab = searchParams.get('tab') || 'general'
  const [activeTab, setActiveTab] = useState(defaultTab)

  const sections = [
    { label: t('portfolio.general'), key: 'general' },
    { label: t('portfolio.publications'), key: 'publications' },
    { label: t('portfolio.teaching'), key: 'teaching' },
    { label: t('portfolio.achievements'), key: 'achievements' },
    { label: t('portfolio.additional'), key: 'additional' },
  ]

  useEffect(() => {
    const current = searchParams.get('tab')
    if (current && current !== activeTab) {
      setActiveTab(current)
    }
  }, [searchParams])

  const handleTabChange = (key: string) => {
    setActiveTab(key)
    router.push(`/portfolio?tab=${key}`)
  }

  return (
    <Layout active={t('groups.portfolio')}>
      <div className="space-y-6">
        {/* Навигация по портфолио */}
        <div className="flex flex-wrap gap-2 bg-white p-4 rounded-xl shadow-sm">
          {sections.map((section) => {
            const isActive = activeTab === section.key
            return (
              <button
                key={section.key}
                onClick={() => handleTabChange(section.key)}
                className={clsx(
                  'relative group px-4 py-2 text-sm font-medium transition-colors duration-300',
                  isActive ? 'text-blue-700 font-semibold' : 'text-gray-700 hover:text-blue-600'
                )}
              >
                {section.label}
                {/* Анимационная линия снизу */}
                <span
                  className={clsx(
                    'absolute left-1/2 bottom-0 h-[2px] bg-blue-600 transition-all duration-300',
                    isActive
                      ? 'w-full -translate-x-1/2'
                      : 'w-0 -translate-x-1/2 group-hover:w-full'
                  )}
                />
              </button>
            )
          })}
        </div>

        {/* Контент секции */}
        <div className="bg-white p-6 rounded-xl shadow-sm min-h-[300px]">
          {activeTab === 'general' && <GeneralSection />}
          {activeTab === 'publications' && <PublicationsSection />}
          {activeTab === 'teaching' && <TeachingSection />}
          {activeTab === 'achievements' && <AchievementsSection />}
          {activeTab === 'additional' && <AdditionalSection />}
        </div>
      </div>
    </Layout>
  )
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PortfolioContent />
    </Suspense>
  )
}

// ---- Секции ----

function GeneralSection() {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t('portfolio.general')}</h2>
      <p className="text-gray-600">{t('portfolio.generalContent')}</p>
    </div>
  )
}

function PublicationsSection() {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t('portfolio.publications')}</h2>
      <p className="text-gray-600">{t('portfolio.publicationsContent')}</p>
    </div>
  )
}

function TeachingSection() {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t('portfolio.teaching')}</h2>
      <p className="text-gray-600">{t('portfolio.teachingContent')}</p>
    </div>
  )
}

function AchievementsSection() {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t('portfolio.achievements')}</h2>
      <p className="text-gray-600">{t('portfolio.achievementsContent')}</p>
    </div>
  )
}

function AdditionalSection() {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t('portfolio.additional')}</h2>
      <p className="text-gray-600">{t('portfolio.additionalContent')}</p>
    </div>
  )
}
