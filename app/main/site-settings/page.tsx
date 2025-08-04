'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Edit3, X } from 'lucide-react'
import { useAvatar } from '@/context/AvatarContext'

const sections = [
  'Аватар',
  'Смена пароля',
  'Контакты',
  'Обо мне',
  'Сертификаты',
  'Курсы',
]

export default function SiteSettingsPage() {
  const [activeSection, setActiveSection] = useState('Аватар')

  return (
    <Layout active="Настройки">
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        {/* Меню: вертикальное на десктопе, горизонтальное на мобиле */}
        <aside className="w-full md:w-64 bg-white rounded-xl p-4 shadow-sm flex md:flex-col flex-wrap gap-2 overflow-x-auto">
          {sections.map((label) => (
            <button
              key={label}
              onClick={() => setActiveSection(label)}
              className={`whitespace-nowrap px-3 py-2 rounded-lg font-medium transition text-sm ${
                activeSection === label
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </aside>

        {/* Контент */}
        <div className="flex-1 bg-white rounded-xl p-4 md:p-6 shadow-sm min-h-[300px]">
          {activeSection === 'Аватар' && <AvatarSection />}
          {activeSection === 'Смена пароля' && <PasswordSection />}
          {activeSection === 'Контакты' && <ContactSection />}
          {activeSection === 'Обо мне' && <AboutSection />}
          {activeSection === 'Сертификаты' && <UploadSection type="certificates" />}
          {activeSection === 'Курсы' && <UploadSection type="courses" />}
        </div>
      </div>
    </Layout>
  )
}

// ----------- Секции ------------------

function AvatarSection() {
  const { avatar, setAvatar } = useAvatar()
  const [newAvatar, setNewAvatar] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatar(url)
      setNewAvatar(file)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-28 h-28">
        <Image
          src={avatar}
          alt="avatar"
          fill
          className="rounded-full object-cover"
        />
        <label className="absolute bottom-0 right-0 bg-white border rounded-full p-1 shadow cursor-pointer">
          <Edit3 size={16} />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      </div>
      <div className="w-full flex justify-end">
        <Button disabled={!newAvatar}>Сохранить</Button>
      </div>
    </div>
  )
}

function PasswordSection() {
  return (
    <div className="space-y-4">
      <Input placeholder="Старый пароль" type="password" />
      <Input placeholder="Новый пароль" type="password" />
      <Input placeholder="Повторите пароль" type="password" />
      <div className="w-full flex justify-end">
        <Button>Сохранить</Button>
      </div>
    </div>
  )
}

function ContactSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input placeholder="Имя" />
      <Input placeholder="Фамилия" />
      <Input placeholder="Телефон" />
      <Input placeholder="Email" />
      <div className="w-full md:col-span-2 flex justify-end">
        <Button>Сохранить</Button>
      </div>
    </div>
  )
}

function AboutSection() {
  return (
    <div>
      <textarea
        rows={6}
        className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="О себе..."
      />
      <div className="w-full flex justify-end mt-4">
        <Button>Сохранить</Button>
      </div>
    </div>
  )
}

// -------------- Универсальный компонент для загрузки файлов ------------------

function UploadSection({ type }: { type: 'certificates' | 'courses' }) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files
    if (!selected) return
    const newFiles = Array.from(selected)
    setFiles((prev) => [...prev, ...newFiles])
  }

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file))
    setPreviews(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [files])

  return (
    <div className="space-y-6">
      <Input type="file" multiple accept="image/*" onChange={handleUpload} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {previews.map((src, idx) => (
          <div
            key={idx}
            className="relative rounded-xl border shadow hover:shadow-md transition overflow-hidden bg-white"
          >
            <Image
              src={src}
              alt={`${type}-${idx}`}
              width={400}
              height={300}
              className="object-cover w-full h-48"
            />
            <div className="p-2 text-sm text-gray-600 truncate">
              {files[idx]?.name}
            </div>
            <button
              onClick={() => handleRemove(idx)}
              className="absolute top-2 right-2 bg-white text-gray-700 hover:text-red-500 p-1 rounded-full shadow"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className="w-full flex justify-end">
        <Button disabled={files.length === 0}>Сохранить</Button>
      </div>
    </div>
  )
}
