'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import clsx from 'clsx'

const sections = [
  { label: 'Общая информация', key: 'general' },
  { label: 'Научная деятельность', key: 'publications' },
  { label: 'Преподавание', key: 'teaching' },
  { label: 'Достижения', key: 'achievements' },
  { label: 'Дополнительно', key: 'additional' },
]

export default function PortfolioPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const defaultTab = searchParams.get('tab') || 'general'
  const [activeTab, setActiveTab] = useState(defaultTab)

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
    <Layout active="Портфолио">
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

// ---- Секции (можно заменить реальными компонентами) ----

function GeneralSection() {
  return <p>Общая информация о преподавателе</p>
}
function PublicationsSection() {
  return <p>Список научных публикаций</p>
}
function TeachingSection() {
  return <p>Информация о преподавательской деятельности</p>
}
function AchievementsSection() {
  return <p>Достижения, награды и конкурсы</p>
}
function AdditionalSection() {
  return <p>Дополнительная информация</p>
}
