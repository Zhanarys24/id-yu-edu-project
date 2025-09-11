
import type { Metadata } from "next"
import "./globals.css"
import { AvatarProvider } from "@/context/AvatarContext"
import { AuthProvider } from '@/context/AuthContext'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400','500','600','700'],
})

export const metadata: Metadata = {
  title: "Yessenov ID",
  description: "Digital University Platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`antialiased ${inter.variable} font-sans`}>
        <AuthProvider>
          <AvatarProvider>
            {children}
          </AvatarProvider>
        </AuthProvider>
      </body>
    </html>
  )
}