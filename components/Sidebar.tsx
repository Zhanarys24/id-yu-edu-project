'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Monitor, Calendar, GraduationCap, BookOpen, Users, FileText,
  Bot, User, Settings, LogOut, BriefcaseBusiness, Menu, X
} from 'lucide-react'
import Image from 'next/image'
import { useAvatar } from '@/context/AvatarContext'
import { useState } from 'react'
import clsx from 'clsx'

export default function Sidebar({ active }: { active?: string }) {
  const pathname = usePathname()
  const { avatar } = useAvatar()
  const [open, setOpen] = useState(false)

  const menuItems = [
    { icon: <Monitor size={18}/>, label: 'Новости', href: '/main/news' },
    { icon: <Calendar size={18}/>, label: 'Мероприятия', href: '/main/calendar' },
    { icon: <GraduationCap size={18}/>, label: 'Образование', href: '/main/education' },
    { icon: <BookOpen size={18}/>, label: 'Наука', href: '/main/science' },
    { icon: <Users size={18}/>, label: 'Воспитание', href: '/main/upbringing' },
    { icon: <FileText size={18}/>, label: 'E‑услуги', href: '/main/E-services' },
    { icon: <Bot size={18}/>, label: 'YessenovBot', href: '/main/yessenovbot' },
    { icon: <User size={18}/>, label: 'Администрирование', href: '/admin' },
  ]
  const accountItems = [
    { icon: <BriefcaseBusiness size={18}/>, label: 'Портфолио', href: '/portfolio' },
    { icon: <Settings size={18}/>, label: 'Настройки', href: '/main/site-settings' },
  ]

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setOpen(true)} className="md:hidden p-3">
        <Menu size={24} />
      </button>

      {/* Backdrop */}
      <div className={clsx(
        'fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity md:hidden',
        open ? 'opacity-100 visible' : 'opacity-0 invisible'
      )} onClick={() => setOpen(false)} />

      {/* Drawer */}
      <aside className={clsx(
        'fixed z-40 top-0 left-0 h-full bg-white p-6 w-64 transform transition-transform duration-300 md:relative md:translate-x-0 md:block shadow-lg',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 mb-8 justify-between">
              <div className="flex items-center gap-2">
                <Image src="/yessenov_blue.png" alt="Лого" width={32} height={32}/>
                <h2 className="text-xl font-semibold text-blue-700">YESSENOV ID</h2>
              </div>
              <button className="md:hidden" onClick={() => setOpen(false)}>
                <X size={24}/>
              </button>
            </div>
            <div className="flex items-center mb-6">
              <Image src={avatar} alt="аватар" width={40} height={40} className="rounded-full object-cover mr-3"/>
              <div>
                <p className="font-bold">Жанарыс Имангалиев</p>
                <p className="text-sm text-gray-500">преподаватель</p>
              </div>
            </div>
            <nav className="space-y-2 text-sm">
              {menuItems.map(item => (
                <MenuItem key={item.label} {...item} active={pathname.startsWith(item.href)}/>
              ))}
            </nav>
          </div>
          <div className="text-sm space-y-2 mt-8">
            <p className="text-gray-500">АККАУНТ</p>
            {accountItems.map(item => (
              <MenuItem key={item.label} {...item} active={pathname.startsWith(item.href)}/>
            ))}
            <button className="text-red-500 font-medium mt-4 flex items-center gap-2">
              <LogOut size={16}/> Выйти
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

function MenuItem({ icon, label, href, active }: {
  icon: React.ReactNode; label: string; href: string; active: boolean
}) {
  return (
    <Link
      href={href}
      className={clsx(
        'relative flex items-center gap-2 pl-3 pr-2 py-2 rounded w-full transition text-sm',
        active
          ? 'bg-blue-50 text-blue-600 font-medium'
          : 'text-gray-700 hover:bg-gray-100'
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
