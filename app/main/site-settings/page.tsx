'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import '@/i18n' 
import { 
  Edit3, X, User, Lock, Phone, Info, Award, BookOpen,
  Camera, Save, Upload, Mail, UserCheck, Shield, Eye, EyeOff, FileText, Calendar
} from 'lucide-react'
import { useAvatar } from '@/context/AvatarContext'
import clsx from 'clsx'

export default function SiteSettingsPage() {
  const { t } = useTranslation('common')
  const [activeSection, setActiveSection] = useState('Аватар')

  const sections = [
    { id: 'Аватар', icon: <User size={18} />, label: t('settings.sections.profile') },
    { id: 'Смена пароля', icon: <Lock size={18} />, label: t('settings.sections.security') },
    { id: 'Контакты', icon: <Phone size={18} />, label: t('settings.sections.contacts') },
    { id: 'Обо мне', icon: <Info size={18} />, label: t('settings.sections.about') },
    { id: 'Сертификаты', icon: <Award size={18} />, label: t('settings.sections.certificates') },
    { id: 'Курсы', icon: <BookOpen size={18} />, label: t('settings.sections.courses') },
  ]

  const activeData = sections.find(s => s.id === activeSection)

  return (
    <Layout active={t('account.settings')}>
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('settings.title')}</h1>
          <p className="text-gray-600">{t('settings.subtitle')}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Боковая навигация */}
          <div className="lg:w-80">
            <nav className="bg-white rounded-2xl shadow-sm p-2 space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200',
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <div className={clsx(
                    'p-2 rounded-lg',
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-500'
                  )}>
                    {section.icon}
                  </div>
                  <span className="font-medium">{section.label}</span>
                  {activeSection === section.id && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Основной контент */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              {/* Заголовок секции */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    {activeData?.icon}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{activeData?.label}</h2>
                </div>
              </div>

              {/* Контент секции */}
              <div className="p-6">
                {activeSection === 'Аватар' && <AvatarSection />}
                {activeSection === 'Смена пароля' && <PasswordSection />}
                {activeSection === 'Контакты' && <ContactSection />}
                {activeSection === 'Обо мне' && <AboutSection />}
                {activeSection === 'Сертификаты' && <UploadSection type="certificates" />}
                {activeSection === 'Курсы' && <UploadSection type="courses" />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

// ------------------- Секции ------------------------

function AvatarSection() {
  const { t } = useTranslation('common')
  const { avatar, setAvatar, userName } = useAvatar()
  const [newAvatar, setNewAvatar] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatar(url)
      setNewAvatar(file)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    // Имитация сохранения
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    setNewAvatar(null)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="relative w-32 h-32 mx-auto">
            <Image
              src={avatar}
              alt="avatar"
              fill
              className="rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center group cursor-pointer">
              <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
            </div>
          </div>
          <label className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer transition-colors">
            <Edit3 size={16} />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-semibold text-gray-900">{userName}</h3>
          <p className="text-gray-600">{t('profile.teacher')}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-medium text-gray-900 mb-2">{t('settings.avatar.recommendations')}</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• {t('settings.avatar.square')}</li>
          <li>• {t('settings.avatar.minSize')}</li>
          <li>• {t('settings.avatar.formats')}</li>
          <li>• {t('settings.avatar.maxSize')}</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <Button 
          disabled={!newAvatar || isLoading}
          onClick={handleSave}
          className="flex items-center gap-2"
        >
          <Save size={16} />
          {isLoading ? t('settings.avatar.saving') : t('settings.avatar.save')}
        </Button>
      </div>
    </div>
  )
}

function PasswordSection() {
  const { t } = useTranslation('common')
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  })
  const [passwords, setPasswords] = useState({
    old: '',
    new: '',
    confirm: ''
  })

  const togglePassword = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Shield className="text-blue-600 mt-0.5" size={20} />
          <div>
            <h4 className="font-medium text-blue-900">{t('settings.password.securityTitle')}</h4>
            <p className="text-sm text-blue-700 mt-1">
              {t('settings.password.securityDesc')}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('settings.password.current')}
          </label>
          <div className="flex items-center gap-2">
            <Input 
              placeholder={t('settings.password.currentPlaceholder')} 
              type={showPasswords.old ? "text" : "password"}
              value={passwords.old}
              onChange={(e) => setPasswords(prev => ({...prev, old: e.target.value}))}
            />
            <button
              type="button"
              onClick={() => togglePassword('old')}
              className="text-gray-500 hover:text-gray-700"
            >
              {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('settings.password.new')}
          </label>
          <div className="flex items-center gap-2">
            <Input 
              placeholder={t('settings.password.newPlaceholder')} 
              type={showPasswords.new ? "text" : "password"}
              value={passwords.new}
              onChange={(e) => setPasswords(prev => ({...prev, new: e.target.value}))}
            />
            <button
              type="button"
              onClick={() => togglePassword('new')}
              className="text-gray-500 hover:text-gray-700"
            >
              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('settings.password.confirm')}
          </label>
          <div className="flex items-center gap-2">
            <Input 
              placeholder={t('settings.password.confirmPlaceholder')} 
              type={showPasswords.confirm ? "text" : "password"}
              value={passwords.confirm}
              onChange={(e) => setPasswords(prev => ({...prev, confirm: e.target.value}))}
            />
            <button
              type="button"
              onClick={() => togglePassword('confirm')}
              className="text-gray-500 hover:text-gray-700"
            >
              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

      </div>

      <div className="flex justify-end">
        <Button className="flex items-center gap-2">
          <Save size={16} />
          {t('settings.password.change')}
        </Button>
      </div>
    </div>
  )
}

function ContactSection() {
  const { t } = useTranslation('common')
  const [dob, setDob] = useState<string>('')

  useEffect(() => {
    const saved = localStorage.getItem('user.birthDate')
    if (saved) setDob(saved)
  }, [])

  const saveContacts = () => {
    if (dob) localStorage.setItem('user.birthDate', dob)
    // здесь можно добавить сохранение других полей при их добавлении
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserCheck size={16} className="inline mr-1" />
            {t('settings.contacts.firstName')}
          </label>
          <Input placeholder={t('settings.contacts.firstNamePlaceholder')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserCheck size={16} className="inline mr-1" />
            {t('settings.contacts.lastName')}
          </label>
          <Input placeholder={t('settings.contacts.lastNamePlaceholder')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone size={16} className="inline mr-1" />
            {t('settings.contacts.phone')}
          </label>
          <Input placeholder="+7 (___) ___-__-__" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail size={16} className="inline mr-1" />
            {t('settings.contacts.email')}
          </label>
          <Input placeholder="example@yessenov.edu.kz" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar size={16} className="inline mr-1" />
            Дата рождения
          </label>
          <Input 
            type="date" 
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">Формат: ГГГГ-ММ-ДД</p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button className="flex items-center gap-2" onClick={saveContacts}>
          <Save size={16} />
          {t('settings.contacts.save')}
        </Button>
      </div>
    </div>
  )
}

function AboutSection() {
  const { t } = useTranslation('common')
  const [text, setText] = useState('')

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('settings.about.title')}
        </label>
        <textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder={t('settings.about.placeholder')}
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">{t('settings.about.maxChars')}</p>
          <p className="text-xs text-gray-500">{text.length}/500</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button className="flex items-center gap-2">
          <Save size={16} />
          {t('settings.about.save')}
        </Button>
      </div>
    </div>
  )
}

function UploadSection({ type }: { type: 'certificates' | 'courses' }) {
  const { t } = useTranslation('common')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files
    if (!selected) return
    const newFiles = Array.from(selected)
    setFiles((prev) => [...prev, ...newFiles])
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
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

  const title = t(`settings.upload.${type}`)

  return (
    <div className="space-y-6">
      {/* Зона загрузки */}
      <div
        className={clsx(
          'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('settings.upload.uploadFiles')} {title}
        </h3>
        <p className="text-gray-600 mb-4">
          {t('settings.upload.dragText')}
        </p>
        <label className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
          <Upload size={16} />
          {t('settings.upload.choose')}
          <input 
            type="file" 
            multiple 
            accept="image/*,application/pdf" 
            onChange={handleUpload}
            className="hidden"
          />
        </label>
        <p className="text-xs text-gray-500 mt-2">
          {t('settings.upload.supportedFormats')}
        </p>
      </div>

      {/* Превью загруженных файлов */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">
            {t('settings.upload.uploadedFiles')} ({files.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {previews.map((src, idx) => (
              <div
                key={idx}
                className="relative group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="aspect-video relative">
                  {files[idx]?.type.startsWith('image/') ? (
                    <Image
                      src={src}
                      alt={`${type}-${idx}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <div className="text-center">
                        <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                        <p className="text-xs text-gray-600">{t('settings.upload.pdfFile')}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {files[idx]?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(files[idx]?.size / 1024 / 1024).toFixed(2)} {t('settings.upload.mb')}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(idx)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          disabled={files.length === 0}
          className="flex items-center gap-2"
        >
          <Save size={16} />
          {t('settings.upload.save')}
        </Button>
      </div>
    </div>
  )
}