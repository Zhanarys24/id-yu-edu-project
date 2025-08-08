import Sidebar from './Sidebar'
import Header from './Header'
import { Inter } from 'next/font/google'
import '../app/globals.css'

export default function Layout({ children, active }: {
  children: React.ReactNode; active?: string
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar active={active} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white px-4 py-3 shadow sticky top-0 z-20">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto bg-[#F6F9FB] px-4 md:px-8 py-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
