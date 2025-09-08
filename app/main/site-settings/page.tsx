'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import '@/i18n' 
import { 
  Edit3, X, User, Lock, Phone, Info,
  Camera, Save, Mail, UserCheck, Shield, Eye, EyeOff, Calendar
} from 'lucide-react'
import { useAvatar } from '@/context/AvatarContext'
import { useAuth } from '@/context/AuthContext'
import { userService } from '@/lib/services/userService'
import clsx from 'clsx'

export default function SiteSettingsPage() {
  const { t } = useTranslation('common')
  const [activeSection, setActiveSection] = useState('Аватар')

  const sections = [
    { id: 'Аватар', icon: <User size={18} />, label: t('settings.sections.profile') },
    { id: 'Смена пароля', icon: <Lock size={18} />, label: t('settings.sections.security') },
    { id: 'Контакты', icon: <Phone size={18} />, label: t('settings.sections.contacts') },
    { id: 'Обо мне', icon: <Info size={18} />, label: t('settings.sections.about') },
    { id: 'Резервная почта', icon: <Mail size={18} />, label: t('settings.sections.reserveEmail') },
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
                {activeSection === 'Резервная почта' && <ReserveEmailSection />}
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
  const { avatar, setAvatar, userName, setUserName, userPosition } = useAvatar()
  const { user } = useAuth()
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

  // Name editing is disabled by requirements; only avatar can be changed

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
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-xl font-semibold text-gray-900">{userName}</h3>
            </div>
            <p className="text-gray-600">{userPosition || user?.position || t('profile.teacher')}</p>
          </div>
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
  const { user } = useAuth()
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
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const togglePassword = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handlePasswordChange = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Пользователь не авторизован' })
      return
    }

    // Валидация
    if (!passwords.old || !passwords.new || !passwords.confirm) {
      setMessage({ type: 'error', text: 'Заполните все поля' })
      return
    }

    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: 'Новые пароли не совпадают' })
      return
    }

    if (passwords.new.length < 6) {
      setMessage({ type: 'error', text: 'Новый пароль должен содержать минимум 6 символов' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const resp = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: passwords.old, new_password: passwords.new })
      })
      const contentType = resp.headers.get('content-type') || ''
      const data = contentType.includes('application/json') ? await resp.json() : null
      if (!resp.ok) {
        const compileErrors = () => {
          if (!data) return ''
          const fields = ['detail','message','current_password','old_password','password','new_password','new_password1','new_password2','non_field_errors','errors']
          const parts: string[] = []
          for (const f of fields) {
            const v = (data as any)[f]
            if (!v) continue
            if (Array.isArray(v)) parts.push(`${f}: ${v.join(', ')}`)
            else if (typeof v === 'object') parts.push(`${f}: ${JSON.stringify(v)}`)
            else parts.push(`${f}: ${String(v)}`)
          }
          return parts.join('\n')
        }
        const msg = compileErrors() || 'Ошибка при смене пароля'
        setMessage({ type: 'error', text: msg })
      } else {
        setMessage({ type: 'success', text: 'Пароль успешно изменен' })
        setPasswords({ old: '', new: '', confirm: '' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка при смене пароля' })
    } finally {
      setIsLoading(false)
    }
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

      {/* Сообщения об ошибках/успехе */}
      {message && (
        <div className={`p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={handlePasswordChange}
          disabled={isLoading || !passwords.old || !passwords.new || !passwords.confirm}
          className="flex items-center gap-2"
        >
          <Save size={16} />
          {isLoading ? 'Изменение...' : t('settings.password.change')}
        </Button>
      </div>
    </div>
  )
}

function ContactSection() {
  const { t } = useTranslation('common')
  const { userName, userPosition } = useAvatar()
  const { user } = useAuth()
  const [dob, setDob] = useState<string>('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('user.birthDate')
    if (saved) setDob(saved)
    
    // Parse name from userName (format: "FirstName LastName")
    const nameParts = userName.split(' ')
    setFirstName(nameParts[0] || '')
    setLastName(nameParts.slice(1).join(' ') || '')
    
    // Set email from user context
    setEmail(user?.email || '')
  }, [userName, user])

  const saveContacts = () => {
    // Contacts are read-only now; nothing to save here
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserCheck size={16} className="inline mr-1" />
            {t('settings.contacts.firstName')}
          </label>
          <Input 
            value={firstName}
            readOnly
            disabled
            placeholder={t('settings.contacts.firstNamePlaceholder')} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserCheck size={16} className="inline mr-1" />
            {t('settings.contacts.lastName')}
          </label>
          <Input 
            value={lastName}
            readOnly
            disabled
            placeholder={t('settings.contacts.lastNamePlaceholder')} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone size={16} className="inline mr-1" />
            {t('settings.contacts.phone')}
          </label>
          <Input placeholder="+7 (___) ___-__-__" readOnly disabled />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail size={16} className="inline mr-1" />
            {t('settings.contacts.email')}
          </label>
          <Input 
            value={email}
            readOnly
            disabled
            placeholder="example@yessenov.edu.kz" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar size={16} className="inline mr-1" />
            Дата рождения
          </label>
          <Input 
            type="date" 
            value={dob}
            readOnly
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">Формат: ГГГГ-ММ-ДД</p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button className="flex items-center gap-2" onClick={saveContacts} disabled>
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

function ReserveEmailSection() {
  const { t } = useTranslation('common')
  const [reserveEmail, setReserveEmail] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('user.reserveEmail')
    if (saved) setReserveEmail(saved)
  }, [])

  const saveReserveEmail = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem('user.reserveEmail', reserveEmail)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('settings.sections.reserveEmail')}
        </label>
        <Input
          type="email"
          value={reserveEmail}
          onChange={(e) => setReserveEmail(e.target.value)}
          placeholder="reserve@example.com"
        />
        <p className="text-xs text-gray-500 mt-1">Укажите резервную почту для восстановления доступа</p>
      </div>
      <div className="flex justify-end">
        <Button onClick={saveReserveEmail} className="flex items-center gap-2" disabled={isSaving}>
          <Save size={16} />
          {isSaving ? 'Сохранение...' : t('common.save')}
        </Button>
      </div>
    </div>
  )
}