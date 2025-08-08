// app/layout.tsx

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AvatarProvider } from "@/context/AvatarContext"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Yessenov ID",
  description: "Digital University Platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} antialiased font-sans`}>
        <AvatarProvider>
          {children}
        </AvatarProvider>
      </body>
    </html>
  )
}
