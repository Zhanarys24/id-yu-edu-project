// layout
import Sidebar from './Sidebar'
import Header from './Header'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import Link from 'next/link'
import { Newspaper, GraduationCap, Atom, Users, Bot, Calendar } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Layout({
  children,
  active,
}: {
  children: React.ReactNode
  active?: string
}) {
  const { t } = useTranslation('common')
  const { user } = useAuth()
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Сайдбар — только на больших экранах */}
      <div className="hidden lg:block">
        <Sidebar active={active} />
      </div>

      {/* Контент */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-[320px]">
        <div className="bg-white px-4 py-3 shadow sticky top-0 z-20">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto bg-[#F6F9FB] px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pb-16">
          {children}
        </main>
      </div>

      {/* Нижняя панель — на мобильных и горизонтальных мобильных */}
      <div className="mobile-bottom-nav fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around py-2 z-50">
        <NavItem href="/main/news" label={t('menu.news')} icon={<Newspaper size={20} />} active={active === 'news'} />
        {user?.role === 'anonymous' ? (
          <>
            <NavItem href="/main/calendar" label={t('menu.calendar')} icon={<Calendar size={20} />} active={active === 'calendar'} />
            <NavItem href="/main/education" label={t('menu.education')} icon={<GraduationCap size={20} />} active={active === 'education'} />
            <NavItem href="/main/science" label={t('menu.science')} icon={<Atom size={20} />} active={active === 'science'} />
            <NavItem href="/main/upbringing" label={t('menu.upbringing')} icon={<Users size={20} />} active={active === 'upbringing'} />
          </>
        ) : (
          <>
            <NavItem href="/main/education" label={t('menu.education')} icon={<GraduationCap size={20} />} active={active === 'education'} />
            <NavItem href="/main/science" label={t('menu.science')} icon={<Atom size={20} />} active={active === 'science'} />
            <NavItem href="/main/upbringing" label={t('menu.upbringing')} icon={<Users size={20} />} active={active === 'upbringing'} />
            <NavItem href="/main/yessenovbot" label={t('menu.yessenovai')} icon={<Bot size={20} />} active={active === 'yessenovai'} />
          </>
        )}
      </div>

      <style jsx>{`
        .mobile-bottom-nav {
          display: flex;
        }
        @media (min-width: 1024px) {
          .mobile-bottom-nav {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}

function NavItem({
  href,
  label,
  icon,
  active,
}: {
  href: string
  label: string
  icon: React.ReactNode
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center text-[11px] ${
        active ? 'text-blue-600' : 'text-gray-500'
      }`}
    >
      {icon}
      <span suppressHydrationWarning>{label}</span>
    </Link>
  )
}
