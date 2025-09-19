'use client'

import Layout from '@/components/Layout'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/i18n'

export default function EservicesPage() {
  const { t } = useTranslation('common')
  const [activeTab, setActiveTab] = useState<'services' | 'history'>('services')
  const [openAccordion, setOpenAccordion] = useState<'certificates' | 'applications' | null>(null)

  const toggleAccordion = (name: 'certificates' | 'applications') => {
    setOpenAccordion((prev) => (prev === name ? null : name))
  }

  const getTypeLabel = (type: 'certificate' | 'application') => {
    // Мапинг переводов для разных языков
    const typeTranslations = {
      'certificate': {
        'ru': 'Справка',
        'en': 'Certificate', 
        'kz': 'Анықтама'
      },
      'application': {
        'ru': 'Заявление',
        'en': 'Application',
        'kz': 'Өтініш'
      }
    }
    
    // Получаем текущий язык из i18n
    const currentLanguage = t('eservices.title') === 'E-services' ? 'en' : 
                           t('eservices.title') === 'E-қызметтер' ? 'kz' : 'ru'
    
    return typeTranslations[type]?.[currentLanguage] || type
  }

  const historyData: Array<{
    service: string
    type: 'certificate' | 'application'
    status: 'approved' | 'pending' | 'rejected'
    date: string
  }> = [
    {
      service: t('eservices.certs.studyProof.title'),
      type: 'certificate',
      status: 'approved',
      date: '03.08.2025',
    },
    {
      service: t('eservices.apps.academicLeave.title'),
      type: 'application',
      status: 'pending',
      date: '01.08.2025',
    },
    {
      service: t('eservices.apps.grantTransfer.title'),
      type: 'application',
      status: 'rejected',
      date: '28.07.2025',
    },
  ]

  return (
    <Layout active="E-services">
      <div className="p-4 sm:p-6 bg-white rounded-xl shadow-sm w-[900px]">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{t('eservices.title')}</h1>
          <p className="text-gray-500 text-sm">{t('eservices.subtitle')}</p>
        </div>

        {/* Карточки */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          <ServiceCard
            image="/white.png"
            overlayImage="/bitrix24 1.png"
            title={t('eservices.bitrix24')}
            description={t('eservices.bitrixDesc')}
            link="#"
            actionLabel={t('eservices.actions.login')}
          />
          <ServiceCard
            image="/blue.png"
            overlayImage="/helpdesk.png"
            title="HelpDesk"
            description={t('eservices.helpdeskDesc')}
            link="#"
            actionLabel={t('eservices.actions.login')}
          />
          <ServiceCard
            image="/blue.png"
            overlayImage="/service.png"
            title="Service"
            description={t('eservices.serviceDesc')}
            link="#"
            actionLabel={t('eservices.actions.login')}
          />
        </div>

        {/* Табы */}
        <div className="flex gap-6 border-b border-gray-200 mb-4 mt-6 sm:mt-8 text-sm font-medium overflow-x-auto">
          <button
            className={`pb-2 ${
              activeTab === 'services' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('services')}
          >
            {t('eservices.tabs.services')}
          </button>
          <button
            className={`pb-2 ${
              activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('history')}
          >
            {t('eservices.tabs.history')}
          </button>
        </div>

        {/* Контент */}
        {activeTab === 'services' && (
          <div className="space-y-3">
            <AccordionItem
              title={t('eservices.sections.certificates')}
              isOpen={openAccordion === 'certificates'}
              onToggle={() => toggleAccordion('certificates')}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <ServiceCard
                  image="/white.png"
                  overlayImage="/certificate.png"
                  title={t('eservices.certs.studyProof.title')}
                  description={t('eservices.certs.studyProof.desc')}
                  link="/services/study-proof"
                  actionLabel={t('eservices.actions.applyCertificate')}
                />
                <ServiceCard
                  image="/white.png"
                  overlayImage="/point.png"
                  title={t('eservices.certs.transcript.title')}
                  description={t('eservices.certs.transcript.desc')}
                  link="/services/transcript"
                  actionLabel={t('eservices.actions.applyCertificate')}
                />
              </div>
            </AccordionItem>

            <AccordionItem
              title={t('eservices.sections.applications')}
              isOpen={openAccordion === 'applications'}
              onToggle={() => toggleAccordion('applications')}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <ServiceCard
                  image="/white.png"
                  overlayImage="/gap-year.png"
                  title={t('eservices.apps.academicLeave.title')}
                  description={t('eservices.apps.academicLeave.desc')}
                  link="/services/academic-leave"
                  actionLabel={t('eservices.actions.applyApplication')}
                />
                <ServiceCard
                  image="/white.png"
                  overlayImage="/grant.png"
                  title={t('eservices.apps.grantTransfer.title')}
                  description={t('eservices.apps.grantTransfer.desc')}
                  link="/services/grant-transfer"
                  actionLabel={t('eservices.actions.applyApplication')}
                />
                <ServiceCard
                  image="/white.png"
                  overlayImage="/termination.png"
                  title={t('eservices.apps.expel.title')}
                  description={t('eservices.apps.expel.desc')}
                  link="/services/expel"
                  actionLabel={t('eservices.actions.applyApplication')}
                />
              </div>
            </AccordionItem>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4 mt-4">
            {historyData.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800">{item.service}</h3>
                  <span className="text-sm text-gray-400">{item.date}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{t('eservices.history.type')}: {getTypeLabel(item.type)}</p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    item.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : item.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {t(`eservices.status.${item.status}`)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

function ServiceCard({
  image,
  overlayImage,
  title,
  description,
  link,
  actionLabel,
}: {
  image: string
  overlayImage?: string
  title: string
  description: string
  link: string
  actionLabel?: string
}) {
  const { t } = useTranslation('common')
  return (
    <div className="bg-white rounded-lg px-5 py-4 shadow-sm flex flex-col justify-between h-52 w-full overflow-hidden">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="relative w-16 h-16 flex-shrink-0">
            <Image src={image} alt={title} fill className="object-contain" />
            {overlayImage && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Image src={overlayImage} alt="Overlay" width={55} height={55} />
              </div>
            )}
          </div>
          <p className="font-semibold text-base">{title}</p>
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <div className="border-t border-gray-200 mt-3 mb-2" />

      <div className="text-right">
        <Link
          href={link}
          target={link.startsWith('http') ? '_blank' : undefined}
          rel={link.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="text-sm text-blue-600 font-medium hover:underline whitespace-nowrap inline-flex items-center gap-1"
        >
          {actionLabel || t('eservices.actions.login')} <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  )
}

function AccordionItem({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border border-gray-200 rounded-md">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700"
      >
        {title}
        <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} size={18} />
      </button>
      {isOpen && <div className="px-4 pb-3">{children}</div>}
    </div>
  )
}