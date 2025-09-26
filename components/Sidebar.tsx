// sidebar
'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import { usePathname, useRouter } from 'next/navigation'
import {
  Monitor, Calendar, GraduationCap, FileText,
  Bot, Settings, LogOut, BriefcaseBusiness, ChevronUp, ChevronDown, Coins,
  FileUser, BookMarked, Briefcase, Trophy, Shield, User, Layers
} from 'lucide-react'
import Image from 'next/image'
import { useMemo, useState, useEffect } from 'react'
import { useAvatar } from '@/context/AvatarContext'
import { useAuth } from '@/context/AuthContext'
import clsx from 'clsx'
import { getTranslatedRole } from '@/lib/utils/roleTranslations'

export default function Sidebar({ active }: { active: string }) {
  const { t, i18n } = useTranslation('common')
  const pathname = usePathname()
  const { avatar, userName, userPosition } = useAvatar()
  const { isAdmin, user, logout } = useAuth()
  const [portfolioOpen, setPortfolioOpen] = useState(false)
  const router = useRouter()
  const [imageOk, setImageOk] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getInitials = (name: string) => {
    const parts = (name || '').trim().split(/\s+/)
    const first = parts[0]?.[0] || ''
    const second = parts[1]?.[0] || ''
    return (first + second).toUpperCase() || ''
  }

  const getColorFromName = (name: string) => {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
    let r = (hash & 0xFF)
    let g = ((hash >> 8) & 0xFF)
    let b = ((hash >> 16) & 0xFF)
    const mix = (c: number) => Math.round((c + 255 + 255) / 3)
    r = mix(r); g = mix(g); b = mix(b)
    const toHex = (c: number) => c.toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  const isValidAvatar = (src: string | null | undefined) => {
    if (!src) return false
    if (src === '/avatar.jpg') return false
    if (src.startsWith('blob:')) return true
    if (src.startsWith('http://') || src.startsWith('https://')) return true
    if (src.startsWith('/')) return true
    return false
  }

  const normalizeAvatarUrl = (src: string | null | undefined) => {
    if (!src) return null
    
    // Handle malformed URLs with triple slashes (http:///uploads/...)
    if (src.startsWith('http:///') || src.startsWith('https:///')) {
      // Remove the extra slash to make it a valid URL
      return src.replace(/^https?:\/\//, 'https://')
    }
    
    return src
  }
  const hasRealAvatar = Boolean(isValidAvatar(avatar) && imageOk)

  const handleLogout = async () => {
    await logout()
  }

  // Проверяем, является ли пользователь анонимным
  const isAnonymous = !user || user.role === 'anonymous'

  const menuItems = isAnonymous
    ? [
        { icon: <Monitor size={20} />, label: t('menu.news'), href: '/main/news' },
        { icon: <Calendar size={20} />, label: t('menu.calendar'), href: '/main/calendar' },
        { icon: <Layers size={20} />, label: t('menu.applications'), href: '/main/applications' },
      ]
    : [
        { icon: <Monitor size={20} />, label: t('menu.news'), href: '/main/news' },
        { icon: <Calendar size={20} />, label: t('menu.calendar'), href: '/main/calendar' },
        { icon: <Layers size={20} />, label: t('menu.applications'), href: '/main/applications' },
        { icon: <Coins size={20} />, label: t('menu.YU-Gamification'), href: '/main/coming-soon/YU-Gamification' },
        { icon: <Bot size={20} />, label: t('menu.yessenovai'), href: '/main/coming-soon/YessenovAI' },
      ]

  const portfolioItems = [
    { icon: <FileUser size={16} />, label: t('portfolio.general'), href: '/portfolio?tab=general' },
    { icon: <BookMarked size={16} />, label: t('portfolio.publications'), href: '/portfolio?tab=publications' },
    { icon: <GraduationCap size={16} />, label: t('portfolio.teaching'), href: '/portfolio?tab=teaching' },
    { icon: <Trophy size={16} />, label: t('portfolio.achievements'), href: '/portfolio?tab=achievements' },
    { icon: <Briefcase size={16} />, label: t('portfolio.additional'), href: '/portfolio?tab=additional' },
  ]

  const accountItems = isAnonymous
    ? []
    : [
        { icon: <Settings size={20} />, label: t('account.settings'), href: '/main/site-settings' },
      ]

  if (!isClient) {
    return (
      <aside className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-gray-200">
          <div className="flex flex-col flex-grow">
            <div className="flex items-center flex-shrink-0 px-4">
              <img
                className="h-8 w-auto"
                src="/yessenov_blue.png"
                alt="Logo"
              />
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {/* Loading state */}
                <div className="text-sm space-y-2 mt-8">
                  <p className="text-gray-500">Loading...</p>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <>
      {/* Десктопный сайдбар */}
      <aside className="hidden md:block fixed z-40 top-0 left-0 h-full bg-white p-6 w-[320px] shadow-lg font-sans">
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <Image src="/yessenov_blue.png" alt={t('common.logo')} width={32} height={32} />
              <h2 className="text-xl font-semibold text-blue-700">YESSENOV ID</h2>
            </div>

            <Link href="/main/site-settings" className="flex items-center mb-6 cursor-pointer">
              {hasRealAvatar ? (
                <div className="mr-3 w-[50px] h-[50px] rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={normalizeAvatarUrl(avatar) || '/avatar.jpg'}
                    alt={t('common.avatar')}
                    width={50}
                    height={50}
                    className="w-full h-full object-cover"
                    onError={() => setImageOk(false)}
                  />
                </div>
              ) : (
                <div
                  className="mr-3 rounded-full w-[50px] h-[50px] grid place-items-center text-white text-sm font-semibold select-none flex-shrink-0"
                  style={{ backgroundColor: getColorFromName(userName || '') }}
                >
                  {getInitials(userName || '')}
                </div>
              )}
              <div>
                <p className="font">{userName}</p>
                {userPosition && (
                  <p className="text-sm text-gray-500">{userPosition}</p>
                )}
                {user?.role && (
                  <p className="text-xs text-blue-600 font-medium">
                    {getTranslatedRole(user.role, t)}
                  </p>
                )}
              </div>
            </Link>

            <nav className="space-y-2 text-sm">
              {menuItems.map((item) => (
                <MenuItem key={item.label} {...item} active={pathname.startsWith(item.href)} />
              ))}
              
              {/* Кнопка Админ - показываем только если пользователь имеет права администратора */}

            </nav>
          </div>

          <div className="text-sm space-y-2 mt-8">
            <p className="text-gray-500">{t('common.account')}</p>

            {/* Портфолио - ВРЕМЕННО СКРЫТО */}
            {/* {!isAnonymous && (
              <div className="relative">
              <button
                onClick={() => setPortfolioOpen(!portfolioOpen)}
                className={clsx(
                  'flex items-center justify-between gap-2 pl-3 pr-2 py-2 rounded w-full transition text-sm hover:bg-gray-100 font-medium',
                  portfolioOpen || pathname.startsWith('/portfolio')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500'
                )}
              >
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness size={20} />
                  <span>{t('groups.portfolio')}</span>
                </div>
                {portfolioOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>

              {portfolioOpen && (
                <div
                  className="absolute left-0 bottom-full mt-1 ml-6 w-[calc(100%-1.5rem)] bg-white border border-gray-200 rounded shadow-lg z-50 space-y-1 py-2"
                >
                  {portfolioItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={clsx(
                        'flex items-center gap-2 px-3 py-2 rounded transition text-xs',
                        pathname === item.href
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
              </div>
            )} */}

            {accountItems.map((item) => (
              <MenuItem key={item.label} {...item} active={pathname.startsWith(item.href)} />
            ))}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 pl-3 pr-2 py-2 rounded w-full transition text-sm text-red-500 hover:bg-gray-100 font-medium"
            >
              <LogOut size={20} /> {t('account.logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Мобильная нижняя панель — показываем только важные пункты */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center h-14">
          <Link
            href="/main/news"
            className={clsx('flex flex-col items-center text-xs', pathname.startsWith('/main/news') ? 'text-blue-600' : 'text-gray-500')}
          >
            <Monitor size={20} />
            <span className="truncate">{t('menu.news')}</span>
          </Link>

          <Link
            href="/main/applications"
            className={clsx('flex flex-col items-center text-xs', pathname.startsWith('/main/applications') ? 'text-blue-600' : 'text-gray-500')}
          >
            <Layers size={20} />
            <span className="truncate">{t('menu.applications')}</span>
          </Link>

          <Link
            href="/main/calendar"
            className={clsx('flex flex-col items-center text-xs', pathname.startsWith('/main/calendar') ? 'text-blue-600' : 'text-gray-500')}
          >
            <Calendar size={20} />
            <span className="truncate">{t('menu.calendar')}</span>
          </Link>

          <Link
            href="/main/site-settings"
            className={clsx('flex flex-col items-center text-xs', pathname.startsWith('/main/site-settings') ? 'text-blue-600' : 'text-gray-500')}
          >
            <User size={20} />
            <span className="truncate">{t('menu.profile')}</span>
          </Link>
        </div>
      </nav>
    </>
  )
}

function MenuItem({
  icon,
  label,
  href,
  active,
}: {
  icon: React.ReactNode
  label: string
  href: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={clsx(
        'relative flex items-center gap-2 pl-3 pr-2 py-2 rounded w-full transition text-lg',
        active
          ? 'bg-blue-50 text-blue-600 font-medium py-4 transition-all duration-300'
          : 'text-gray-500 hover:bg-gray-100 py-2'
      )}
    >
      {icon}
      <span suppressHydrationWarning>{label}</span>
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-blue-600 rounded-r" />
      )}
    </Link>
  )
}