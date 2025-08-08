'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Monitor, Calendar, GraduationCap, BookOpen, Users, FileText,
  Bot, User, Settings, LogOut, BriefcaseBusiness, Menu, X, ChevronUp, ChevronDown,
  FileUser, Award, BookMarked, Briefcase, Trophy
} from 'lucide-react'
import Image from 'next/image'
import { useAvatar } from '@/context/AvatarContext'
import { useState } from 'react'
import clsx from 'clsx'

export default function Sidebar({ active }: { active?: string }) {
  const pathname = usePathname()
  const { avatar, userName } = useAvatar()
  const [open, setOpen] = useState(false)
  const [portfolioOpen, setPortfolioOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const menuItems = [
    { icon: <Monitor size={20} />, label: 'Новости', href: '/main/news' },
    { icon: <Calendar size={20} />, label: 'Мероприятия', href: '/main/calendar' },
    { icon: <GraduationCap size={20} />, label: 'Образование', href: '/main/education' },
    { icon: <BookOpen size={20} />, label: 'Наука', href: '/main/science' },
    { icon: <Users size={20} />, label: 'Воспитание', href: '/main/upbringing' },
    { icon: <FileText size={20} />, label: 'E‑услуги', href: '/main/E-services' },
    { icon: <Bot size={20} />, label: 'YessenovAI', href: '/main/yessenovbot' },
    // { icon: <User size={20} />, label: 'Администрирование', href: '/admin' },
  ]
const portfolioItems = [
  { icon: <FileUser size={16} />, label: 'Общая информация', href: '/portfolio?tab=general' },
  { icon: <BookMarked size={16} />, label: 'Публикации и научная деятельность', href: '/portfolio?tab=publications' },
  { icon: <GraduationCap size={16} />, label: 'Преподавательская деятельность', href: '/portfolio?tab=teaching' },
  { icon: <Trophy size={16} />, label: 'Достижения и награды', href: '/portfolio?tab=achievements' },
  { icon: <Briefcase size={16} />, label: 'Дополнительная деятельность', href: '/portfolio?tab=additional' },
]


  const accountItems = [
    { icon: <Settings size={20} />, label: 'Настройки', href: '/main/site-settings' },
  ]

  return (
    <>
      <button onClick={() => setOpen(true)} className="md:hidden p-3">
        <Menu size={24} />
      </button>

      <div
        className={clsx(
          'fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity md:hidden',
          open ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
        onClick={() => setOpen(false)}
      />

      <aside
        className={clsx(
          'fixed z-40 top-0 left-0 h-full bg-white p-6 w-[320px] transform transition-transform duration-300 md:relative md:translate-x-0 md:block shadow-lg font-sans',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 mb-8 justify-between">
              <div className="flex items-center gap-2">
                <Image src="/yessenov_blue.png" alt="Лого" width={32} height={32} />
                <h2 className="text-xl font-semibold text-blue-700">YESSENOV ID</h2>
              </div>
              <button className="md:hidden" onClick={() => setOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="flex items-center mb-6">
              <Image
                src={avatar}
                alt="аватар"
                width={50}
                height={50}
                className="rounded-full object-cover mr-3"
              />
              <div>
                <p className="font">{userName}</p>
                <p className="text-sm text-gray-500">преподаватель</p>
              </div>
            </div>

            <nav className="space-y-2 text-sm">
              {menuItems.map((item) => (
                <MenuItem key={item.label} {...item} active={pathname.startsWith(item.href)} />
              ))}
            </nav>
          </div>

          <div className="text-sm space-y-2 mt-8">
            <p className="text-gray-500">АККАУНТ</p>

            {/* Выпадающее портфолио с absolute */}
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

            {accountItems.map((item) => (
              <MenuItem key={item.label} {...item} active={pathname.startsWith(item.href)} />
            ))}

            <button
              onClick={handleLogout}
              className={clsx(
                'flex items-center gap-2 pl-3 pr-2 py-2 rounded w-full transition text-sm text-red-500 hover:bg-gray-100 font-medium'
              )}
            >
              <LogOut size={20} /> Выйти
            </button>
          </div>
        </div>
      </aside>
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
      <span>{label}</span>
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-blue-600 rounded-r" />
      )}
    </Link>
  )
}
