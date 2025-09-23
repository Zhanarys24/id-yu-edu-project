// sidebar
'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import { usePathname, useRouter } from 'next/navigation'
import {
  Monitor, Calendar, GraduationCap, BookOpen, Users, FileText,
  Bot, Settings, LogOut, BriefcaseBusiness, ChevronUp, ChevronDown, Coins,
  FileUser, BookMarked, Briefcase, Trophy, Shield
} from 'lucide-react'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { useAvatar } from '@/context/AvatarContext'
import { useAuth } from '@/context/AuthContext'
import clsx from 'clsx'

export default function Sidebar({ active }: { active?: string }) {
  const { t } = useTranslation('common')
  const pathname = usePathname()
  const { avatar, userName, userPosition } = useAvatar()
  const { isAdmin, user, logout } = useAuth()
  const [portfolioOpen, setPortfolioOpen] = useState(false)
  const router = useRouter()
  const [imageOk, setImageOk] = useState(true)

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

  const menuItems = user?.role === 'anonymous' 
    ? [
        { icon: <Monitor size={20} />, label: 'Новости', href: '/main/news' },
        { icon: <Calendar size={20} />, label: 'Календарь', href: '/main/calendar' },
        { icon: <GraduationCap size={20} />, label: 'Образование', href: '/main/education' },
        { icon: <BookOpen size={20} />, label: 'Наука', href: '/main/science' },
        { icon: <Users size={20} />, label: 'Воспитание', href: '/main/upbringing' },
        { icon: <FileText size={20} />, label: 'Электронные услуги', href: '/main/E-services' },
      ]
    : [
        { icon: <Monitor size={20} />, label: 'Новости', href: '/main/news' },
        { icon: <Calendar size={20} />, label: 'Календарь', href: '/main/calendar' },
        { icon: <GraduationCap size={20} />, label: 'Образование', href: '/main/education' },
        { icon: <BookOpen size={20} />, label: 'Наука', href: '/main/science' },
        { icon: <Users size={20} />, label: 'Воспитание', href: '/main/upbringing' },
        { icon: <FileText size={20} />, label: 'Электронные услуги', href: '/main/E-services' },
        { icon: <Bot size={20} />, label: 'YessenovAI', href: '/main/coming-soon/YessenovAI' },
        { icon: <Coins size={20} />, label: 'YU-Геймификация', href: '/main/coming-soon/YU-Gamification' },
      ]

  const portfolioItems = [
    { icon: <FileUser size={16} />, label: 'Общие данные', href: '/portfolio?tab=general' },
    { icon: <BookMarked size={16} />, label: 'Публикации', href: '/portfolio?tab=publications' },
    { icon: <GraduationCap size={16} />, label: 'Преподавательская деятельность', href: '/portfolio?tab=teaching' },
    { icon: <Trophy size={16} />, label: 'Достижения', href: '/portfolio?tab=achievements' },
    { icon: <Briefcase size={16} />, label: 'Дополнительно', href: '/portfolio?tab=additional' },
  ]

  const accountItems = user?.role === 'anonymous' 
    ? []
    : [
        { icon: <Settings size={20} />, label: 'Настройки', href: '/main/site-settings' },
      ]

  return (
    <>
      {/* Десктопный сайдбар */}
      <aside className="hidden md:block fixed z-40 top-0 left-0 h-full bg-white p-6 w-[320px] shadow-lg font-sans">
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <Image src="/yessenov_blue.png" alt="Лого" width={32} height={32} />
              <h2 className="text-xl font-semibold text-blue-700">YESSENOV ID</h2>
            </div>

            <Link href="/main/site-settings" className="flex items-center mb-6 cursor-pointer">
              {hasRealAvatar ? (
                <Image
                  src={normalizeAvatarUrl(avatar) || '/avatar.jpg'}
                  alt="аватар"
                  width={50}
                  height={50}
                  className="rounded-full object-cover mr-3"
                  onError={() => setImageOk(false)}
                />
              ) : (
                <div
                  className="mr-3 rounded-full w-[50px] h-[50px] grid place-items-center text-white text-sm font-semibold select-none"
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
                    {user.role}
                  </p>
                )}
              </div>
            </Link>

            <nav className="space-y-2 text-sm">
              {menuItems.map((item) => (
                <MenuItem key={item.label} {...item} active={pathname.startsWith(item.href)} />
              ))}
              
              {/* Кнопка Админ под YU-Gamification */}
              {isAdmin() && (
                <Link
                  href="/admin"
                  className={clsx(
                    'flex items-center gap-2 pl-3 pr-2 py-2 rounded transition text-sm font-medium',
                    pathname.startsWith('/admin')
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-500 hover:bg-gray-100'
                  )}
                >
                  <Shield size={20} />
                  <span>Админ панель</span>
                </Link>
              )}
            </nav>
          </div>

          <div className="text-sm space-y-2 mt-8">
            <p className="text-gray-500">АККАУНТ</p>

            {/* Портфолио - только для авторизованных пользователей */}
            {user?.role !== 'anonymous' && (
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
                  <span>Портфолио</span>
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
            )}

            {accountItems.map((item) => (
              <MenuItem key={item.label} {...item} active={pathname.startsWith(item.href)} />
            ))}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 pl-3 pr-2 py-2 rounded w-full transition text-sm text-red-500 hover:bg-gray-100 font-medium"
            >
              <LogOut size={20} /> Выйти
            </button>
          </div>
        </div>
      </aside>

      {/* Мобильная нижняя панель — показываем только важные пункты + "Ещё" */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center h-14">
          <Link
            href="/main/news"
            className={clsx('flex flex-col items-center text-xs', pathname.startsWith('/main/news') ? 'text-blue-600' : 'text-gray-500')}
          >
            <Monitor size={20} />
            <span className="truncate">Новости</span>
          </Link>

          <Link
            href="/main/education"
            className={clsx('flex flex-col items-center text-xs', pathname.startsWith('/main/education') ? 'text-blue-600' : 'text-gray-500')}
          >
            <GraduationCap size={20} />
            <span className="truncate">Образование</span>
          </Link>

          <Link
            href="/main/science"
            className={clsx('flex flex-col items-center text-xs', pathname.startsWith('/main/science') ? 'text-blue-600' : 'text-gray-500')}
          >
            <BookOpen size={20} />
            <span className="truncate">Наука</span>
          </Link>

          <Link
            href="/main/upbringing"
            className={clsx('flex flex-col items-center text-xs', pathname.startsWith('/main/upbringing') ? 'text-blue-600' : 'text-gray-500')}
          >
            <Users size={20} />
            <span className="truncate">Воспитание</span>
          </Link>

          <Link
            href="/main/yessenovbot"
            className={clsx('flex flex-col items-center text-xs', pathname.startsWith('/main/yessenovbot') ? 'text-blue-600' : 'text-gray-500')}
          >
            <Bot size={20} />
            <span className="truncate">Yessenov AI</span>
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