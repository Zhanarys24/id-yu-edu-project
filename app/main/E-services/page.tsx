'use client'

import Layout from '@/components/Layout'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

export default function EservicesPage() {
  const [activeTab, setActiveTab] = useState<'services' | 'history'>('services')
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)

  const toggleAccordion = (name: string) => {
    setOpenAccordion((prev) => (prev === name ? null : name))
  }

  const historyData = [
    {
      service: 'Справка об обучении',
      type: 'Справка',
      status: 'Одобрено',
      date: '03.08.2025',
    },
    {
      service: 'Академический отпуск',
      type: 'Заявление',
      status: 'На рассмотрении',
      date: '01.08.2025',
    },
    {
      service: 'Перевод на грант',
      type: 'Заявление',
      status: 'Отклонено',
      date: '28.07.2025',
    },
  ]

  return (
    <Layout active="E-services">
      <div className="p-4 sm:p-6 bg-white rounded-xl shadow-sm">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">E-услуги</h1>
          <p className="text-gray-500 text-sm">Онлайн-сервисы для запросов, справок и поддержки</p>
        </div>

        {/* Карточки */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <ServiceCard
            image="/white.png"
            overlayImage="/bitrix24 1.png"
            title="Битрикс24"
            description="Внутренний документооборот"
            link="#"
          />
          <ServiceCard
            image="/blue.png"
            overlayImage="/helpdesk.png"
            title="HelpDesk"
            description="Техническая поддержка"
            link="#"
          />
          <ServiceCard
            image="/blue.png"
            overlayImage="/service.png"
            title="Service"
            description="Решение производственных проблем"
            link="#"
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
            Услуги
          </button>
          <button
            className={`pb-2 ${
              activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('history')}
          >
            История
          </button>
        </div>

        {/* Контент */}
        {activeTab === 'services' && (
          <div className="space-y-3">
            <AccordionItem
              title="Справки"
              isOpen={openAccordion === 'Справки'}
              onToggle={() => toggleAccordion('Справки')}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <ServiceCard
                  image="/white.png"
                  overlayImage="/certificate.png"
                  title="Справка об обучении"
                  description="Запрос справки о текущем обучении"
                  link="/services/study-proof"
                  actionLabel="Подать справку"
                />
                <ServiceCard
                  image="/white.png"
                  overlayImage="/point.png"
                  title="Транскрипт"
                  description="Заказать академический транскрипт"
                  link="/services/transcript"
                  actionLabel="Подать справку"
                />
              </div>
            </AccordionItem>

            <AccordionItem
              title="Заявления"
              isOpen={openAccordion === 'Заявления'}
              onToggle={() => toggleAccordion('Заявления')}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <ServiceCard
                  image="/white.png"
                  overlayImage="/gap-year.png"
                  title="Академический отпуск"
                  description="Подача заявления на академ. отпуск"
                  link="/services/academic-leave"
                  actionLabel="Подать заявление"
                />
                <ServiceCard
                  image="/white.png"
                  overlayImage="/grant.png"
                  title="Перевод на грант"
                  description="Заявление на перевод с платного на грант"
                  link="/services/grant-transfer"
                  actionLabel="Подать заявление"
                />
                <ServiceCard
                  image="/white.png"
                  overlayImage="/termination.png"
                  title="Отчисление"
                  description="Подача заявления на отчисление"
                  link="/services/expel"
                  actionLabel="Подать заявление"
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
                <p className="text-sm text-gray-600 mb-1">Тип: {item.type}</p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    item.status === 'Одобрено'
                      ? 'bg-green-100 text-green-700'
                      : item.status === 'Отклонено'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {item.status}
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
          {actionLabel || 'Войти'} <ChevronRight size={16} />
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
