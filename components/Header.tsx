// хедар сайта
'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Bell, X, Monitor, Calendar, GraduationCap, BookOpen, 
  Users, FileText, Settings, LogOut, BriefcaseBusiness,
  FileUser, BookMarked, Briefcase, Trophy, Search
} from 'lucide-react'

type AppNotification = {
  id: string
  text: string
  read: boolean
  link?: string
  category?: 'news' | 'system' | 'message' | 'event' | 'birthday'
  createdAt: string
}

export default function Header() {
  const { t, i18n } = useTranslation('common')
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false) // notifications modal
  const [isExpanded, setIsExpanded] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
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

  // Load notifications and add birthday greeting if today
  useEffect(() => {
    try {
      const raw = localStorage.getItem('notifications')
      let loaded: AppNotification[] = raw ? JSON.parse(raw) : []

      if (loaded.length === 0) {
        // Seed with localized samples (varied categories)
        const now = Date.now()
        loaded = [
          {
            id: 'n1',
            text: t('notifications.samples.newsHackathon', 'Вышла новая новость: Открыт набор на хакатон'),
            read: false,
            link: '/main/news',
            category: 'news',
            createdAt: new Date(now - 1 * 60_000).toISOString(),
          },
          {
            id: 'n2',
            text: t('notifications.samples.curatorMeeting', 'Напоминание: встреча с куратором завтра в 10:00'),
            read: false,
            link: '/main/calendar',
            category: 'event',
            createdAt: new Date(now - 30 * 60_000).toISOString(),
          },
          {
            id: 'n3',
            text: t('notifications.samples.eservicesStatus', 'E-услуги: ваш запрос на справку одобрен'),
            read: false,
            link: '/main/E-services',
            category: 'system',
            createdAt: new Date(now - 2 * 60 * 60_000).toISOString(),
          },
          {
            id: 'n4',
            text: t('notifications.samples.portfolioAchievement', 'Поздравляем! Новая запись в достижениях добавлена'),
            read: true,
            link: '/portfolio?tab=achievements',
            category: 'system',
            createdAt: new Date(now - 4 * 60 * 60_000).toISOString(),
          },
          {
            id: 'n5',
            text: t('notifications.samples.aiReply', 'YessenovAI: получен ответ на ваш запрос'),
            read: true,
            link: '/main/yessenovbot',
            category: 'message',
            createdAt: new Date(now - 6 * 60 * 60_000).toISOString(),
          },
          {
            id: 'n6',
            text: t('notifications.samples.calendarRoom', 'Календарь: аудитория 3.215 забронирована на 16:00'),
            read: false,
            link: '/main/calendar',
            category: 'event',
            createdAt: new Date(now - 8 * 60 * 60_000).toISOString(),
          },
          {
            id: 'n7',
            text: t('notifications.samples.settingsSecurity', 'Безопасность: рекомендуется обновить пароль аккаунта'),
            read: true,
            link: '/main/site-settings',
            category: 'system',
            createdAt: new Date(now - 12 * 60 * 60_000).toISOString(),
          },
          {
            id: 'n8',
            text: t('notifications.samples.newsGrant', 'Новость: объявлены дополнительные гранты на магистратуру'),
            read: false,
            link: '/main/news',
            category: 'news',
            createdAt: new Date(now - 1 * 24 * 60 * 60_000).toISOString(),
          },
          {
            id: 'n9',
            text: t('notifications.samples.clubEvent', 'Клубы: сегодня в 18:00 открытая встреча IT-клуба'),
            read: true,
            link: '/main/upbringing',
            category: 'event',
            createdAt: new Date(now - 2 * 24 * 60 * 60_000).toISOString(),
          },
          {
            id: 'n10',
            text: t('notifications.samples.scienceCall', 'Наука: приём заявок на публикации в журнале открыт'),
            read: false,
            link: '/main/science',
            category: 'news',
            createdAt: new Date(now - 3 * 24 * 60 * 60_000).toISOString(),
          },
        ]
      }

      // Add birthday greeting once per year
      const today = new Date()
      const key = `birthday_greeted_${today.getFullYear()}`
      const greetedThisYear = localStorage.getItem(key) === '1'
      const isUserBirthdayToday = false // replace with real check if user profile available
      if ((isUserBirthdayToday || true) && !greetedThisYear) {
        // Show a generic university birthday greeting once per year
        const birthday: AppNotification = {
          id: `bday_${today.getFullYear()}`,
          text: t('notifications.birthdayGreeting', 'С Днём рождения! Yessenov University поздравляет вас и желает успехов! 🎉'),
          read: false,
          category: 'birthday',
          createdAt: today.toISOString(),
        }
        loaded = [birthday, ...loaded]
        localStorage.setItem(key, '1')
      }

      setNotifications(loaded)
    } catch {
      setNotifications([])
    }
  }, [i18n.language])

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications))
    } catch {}
  }, [notifications])

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

  const toggleModal = () => setIsOpen(!isOpen)
  const clearNotifications = () => setNotifications([])
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const unreadCount = notifications.filter(n => !n.read).length

  const onClickNotification = (n: AppNotification) => {
    setNotifications(prev => prev.map(it => it.id === n.id ? { ...it, read: true } : it))
    if (n.link) {
      router.push(n.link)
      setIsOpen(false)
    }
  }

  const menuItems = [
    { icon: <Monitor size={20} />, label: t('menu.news'), href: '/main/news' },
    { icon: <Calendar size={20} />, label: t('menu.calendar'), href: '/main/calendar' },
    { icon: <GraduationCap size={20} />, label: t('menu.education'), href: '/main/education' },
    { icon: <BookOpen size={20} />, label: t('menu.science'), href: '/main/science' },
    { icon: <Users size={20} />, label: t('menu.upbringing'), href: '/main/upbringing' },
    { icon: <FileText size={20} />, label: t('menu.eservices'), href: '/main/E-services' },
    { label: t('menu.yessenovai'), href: '/main/yessenovbot' },
  ]

  const portfolioItems = [
    { icon: <FileUser size={18} />, label: t('portfolio.general'), href: '/portfolio?tab=general' },
    { icon: <BookMarked size={18} />, label: t('portfolio.publications'), href: '/portfolio?tab=publications' },
    { icon: <GraduationCap size={18} />, label: t('portfolio.teaching'), href: '/portfolio?tab=teaching' },
    { icon: <Trophy size={18} />, label: t('portfolio.achievements'), href: '/portfolio?tab=achievements' },
    { icon: <Briefcase size={18} />, label: t('portfolio.additional'), href: '/portfolio?tab=additional' },
  ]

  const accountItems = [
    { icon: <Settings size={20} />, label: t('account.settings'), href: '/main/site-settings' },
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

  return (
    <div className="relative flex justify-end items-center gap-4">
      <div className="relative">
        <Bell
          className="w-5 h-5 text-gray-500 cursor-pointer"
          onClick={toggleModal}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>

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
            className={`fixed top-[60px] right-6 ${isExpanded ? 'w-[540px] max-h-[70vh]' : 'w-72 max-h-96'} bg-white border border-gray-300 rounded-lg shadow-lg z-50 overflow-hidden flex flex-col`}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{t('notifications.title', 'Уведомления')}</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{t('notifications.newCount', { count: unreadCount })}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={markAllRead} className="text-xs text-gray-500 hover:underline">
                  {t('notifications.markAllRead', 'Прочитать всё')}
                </button>
              </div>
            </div>

            {/* List */}
            <div className={`overflow-y-auto ${isExpanded ? 'max-h-[60vh]' : 'max-h-72'}`}>
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm px-4 py-6 text-center">{t('notifications.empty')}</p>
              ) : (
                notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => onClickNotification(n)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                      n.read ? 'bg-white' : 'bg-blue-50/60'
                    }`}
                  >
                    <span className={`mt-1 w-2 h-2 rounded-full ${n.read ? 'bg-gray-300' : 'bg-blue-500'}`} />
                    <div className="flex-1">
                      <div className={`text-sm ${n.read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>{n.text}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200">
              <button onClick={clearNotifications} className="text-xs text-red-500 hover:underline">
                {t('notifications.clearAll')}
              </button>
              <button onClick={() => setIsExpanded(v => !v)} className="text-xs text-blue-600 hover:underline">
                {isExpanded ? t('notifications.compact', 'Свернуть') : t('notifications.viewMore')}
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

      {/* Компактная модалка карты приложения */}
      {isAppMapOpen && (
        <>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            aria-modal="true"
            role="dialog"
            onClick={() => setIsAppMapOpen(false)}
          >
            <div
              className="bg-white w-full max-w-2xl max-h-[80vh] rounded-lg shadow-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Заголовок */}
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="text-lg font-medium">{t('appMap.title')}</h3>
                  <p className="text-xs text-gray-500">{t('appMap.subtitle')}</p>
                </div>
                <button onClick={() => setIsAppMapOpen(false)} className="p-2 hover:bg-gray-100 rounded">
                  <X size={18} />
                </button>
              </div>

              {/* Поиск */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={t('appMap.searchPlaceholder')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Контент с прокруткой */}
              <div className="p-4 max-h-[50vh] overflow-y-auto">
                {/* Основные разделы */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('groups.sections')}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {menuItems
                      .filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
                      .map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsAppMapOpen(false)}
                          className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {item.icon && <span className="text-gray-600 flex-shrink-0">{item.icon}</span>}
                          <span className="text-sm text-gray-800 font-medium truncate">{item.label}</span>
                        </Link>
                      ))}
                  </div>
                </div>

                {/* Портфолио */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('groups.portfolio')}</h4>
                  <div className="space-y-1">
                    {portfolioItems
                      .filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
                      .map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsAppMapOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-gray-600 flex-shrink-0">{item.icon}</span>
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </Link>
                      ))}
                  </div>
                </div>

                {/* Аккаунт */}
                <div className="mb-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('groups.account')}</h4>
                  <div className="space-y-1">
                    {accountItems
                      .filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
                      .map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsAppMapOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-gray-600 flex-shrink-0">{item.icon}</span>
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </Link>
                      ))}
                  </div>
                </div>

                {/* Сообщение, если ничего не найдено */}
                {menuItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase())).length === 0 &&
                 portfolioItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase())).length === 0 &&
                 accountItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase())).length === 0 && 
                 query && (
                  <p className="text-gray-500 text-sm text-center py-4">{t('appMap.nothingFound')}</p>
                )}
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