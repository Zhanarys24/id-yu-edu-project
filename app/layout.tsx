// app/layout.tsx

import type { Metadata } from "next"
import "./globals.css"
import { AvatarProvider } from "@/context/AvatarContext"
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: "Yessenov ID",
  description: "Digital University Platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`antialiased font-sans`}>
        <AuthProvider>
          <AvatarProvider>
            {children}
          </AvatarProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
