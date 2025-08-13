'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import Link from 'next/link'
import { Bell, X } from 'lucide-react'

const initialNotifications = [
  { id: 1, text: '' },
  { id: 2, text: '' },
  { id: 3, text: '' },
]

export default function Header() {
  const { t, i18n } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false) // notifications modal
  
  const translatedNotifications = useMemo(
    () => [
      { id: 1, text: t('notifications.items.1') },
      { id: 2, text: t('notifications.items.2') },
      { id: 3, text: t('notifications.items.3') },
    ],
    [i18n.language]
  )

  const [notifications, setNotifications] = useState(() => translatedNotifications)
  const [isAppMapOpen, setIsAppMapOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [locale, setLocale] = useState('ru')

  useEffect(() => {
    // При загрузке читаем локаль из localStorage
    const savedLocale = localStorage.getItem('locale')
    const initial = savedLocale || i18n.language || 'ru'
    setLocale(initial)
    if (i18n.language !== initial) {
      i18n.changeLanguage(initial)
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = initial
    }
  }, [])

  // При смене языка сохраняем в localStorage
  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLocale = e.target.value
    setLocale(selectedLocale)
    localStorage.setItem('locale', selectedLocale)
    i18n.changeLanguage(selectedLocale)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = selectedLocale
    }
  }

  // Навигация и остальные данные можно адаптировать под locale (если есть тексты на разных языках)
  // Сейчас просто пример на русском

  const toggleModal = () => setIsOpen(!isOpen)
  const clearNotifications = () => setNotifications([])

  // Обновлять текст уведомлений при смене языка, если список не очищен
  useEffect(() => {
    if (notifications.length > 0) {
      setNotifications(translatedNotifications)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translatedNotifications])

  const menuItems = [
    { label: t('menu.news'), href: '/main/news' },
    { label: t('menu.calendar'), href: '/main/calendar' },
    { label: t('menu.education'), href: '/main/education' },
    { label: t('menu.science'), href: '/main/science' },
    { label: t('menu.upbringing'), href: '/main/upbringing' },
    { label: t('menu.eservices'), href: '/main/E-services' },
    { label: t('menu.yessenovai'), href: '/main/yessenovbot' },
  ]

  const portfolioItems = [
    { label: t('portfolio.general'), href: '/portfolio?tab=general' },
    { label: t('portfolio.publications'), href: '/portfolio?tab=publications' },
    { label: t('portfolio.teaching'), href: '/portfolio?tab=teaching' },
    { label: t('portfolio.achievements'), href: '/portfolio?tab=achievements' },
    { label: t('portfolio.additional'), href: '/portfolio?tab=additional' },
  ]

  const accountItems = [
    { label: t('account.settings'), href: '/main/site-settings' },
    { label: t('account.logout'), href: '/logout' },
  ]

  const allItems = [
    { group: t('groups.sections'), items: menuItems },
    { group: t('groups.portfolio'), items: portfolioItems },
    { group: t('groups.account'), items: accountItems },
  ]

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAppMapOpen(false)
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const filteredGroups = allItems
    .map(group => ({
      ...group,
      items: group.items.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    }))
    .filter(g => g.items.length > 0)

  return (
    <div className="relative flex justify-end items-center gap-4">
      <Bell
        className="w-5 h-5 text-gray-500 cursor-pointer"
        onClick={toggleModal}
      />

      <select
        className="text-sm border border-gray-300 rounded px-2 py-1"
        onChange={changeLanguage}
        value={locale}
        aria-label={t('aria.languageSelect')}
        suppressHydrationWarning
      >
        <option value="ru">Русский</option>
        <option value="kz">Қазақша</option>
        <option value="en">English</option>
      </select>

      {/* Кнопка: Карта приложения */}
      <button
        onClick={() => setIsAppMapOpen(true)}
        className="text-sm px-3 py-1 border border-gray-200 rounded hover:bg-gray-50"
        aria-haspopup="dialog"
      >
        {t('appMap.button')}
      </button>

      {/* Notifications modal */}
      {isOpen && (
        <>
          <div
            className="fixed top-[60px] right-6 w-72 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-96 overflow-y-auto"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="p-4">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm">{t('notifications.empty')}</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="border-b border-gray-200 py-2 text-sm">
                    {n.text}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between items-center border-t border-gray-200 px-4 py-2">
                <button
                onClick={clearNotifications}
                className="text-red-500 text-xs hover:underline"
              >
                	{t('notifications.clearAll')}
              </button>
              <button
                onClick={() => alert('Переход к просмотру всех уведомлений')}
                className="text-blue-600 text-xs hover:underline"
              >
                  {t('notifications.viewMore')}
              </button>
            </div>
          </div>

          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}

      {/* App map modal */}
      {isAppMapOpen && (
        <>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            aria-modal="true"
            role="dialog"
            onClick={() => setIsAppMapOpen(false)}
          >
            <div
              className="bg-white w-full max-w-3xl rounded-lg shadow-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="text-lg font-medium">{t('appMap.title')}</h3>
                  <p className="text-xs text-gray-500">{t('appMap.subtitle')}</p>
                </div>
                <button onClick={() => setIsAppMapOpen(false)} className="p-2">
                  <X size={18} />
                </button>
              </div>

              <div className="p-4">
                <div className="mb-3">
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={t('appMap.searchPlaceholder')}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                  {filteredGroups.length === 0 ? (
                    <p className="text-gray-500 text-sm">{t('appMap.nothingFound')}</p>
                  ) : (
                    filteredGroups.map(group => (
                      <div key={group.group}>
                        <h4 className="text-sm font-semibold mb-2">{group.group}</h4>
                        <ul className="space-y-1">
                          {group.items.map(item => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                onClick={() => setIsAppMapOpen(false)}
                                className="block px-3 py-2 rounded hover:bg-gray-50 text-sm text-gray-700"
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Link
                    href="/app-map"
                    onClick={() => setIsAppMapOpen(false)}
                    className="text-sm px-3 py-2 border rounded"
                  >
                    {t('appMap.openPage')}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setIsAppMapOpen(false)}
          />
        </>
      )}
    </div>
  )
}
