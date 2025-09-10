'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import NextImage from 'next/image'
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
import { useRouter } from 'next/navigation'
import { AuthApi } from '@/lib/services/authApi'

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
  const { user, uploadAvatarFile } = useAuth()
  const [newAvatar, setNewAvatar] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [imageOk, setImageOk] = useState(true)
  const [success, setSuccess] = useState<string>('')

  const isValidAvatar = (src: string | null | undefined) => {
    if (!src) return false
    if (src === '/avatar.jpg') return false
    // allow blobs and http(s) and absolute public paths
    if (src.startsWith('blob:')) return true
    if (src.startsWith('http://') || src.startsWith('https://')) return true
    if (src.startsWith('/')) return true
    return false
  }
  const hasRealAvatar = Boolean(isValidAvatar(avatar) && imageOk)

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/)
    const first = parts[0]?.[0] || ''
    const second = parts[1]?.[0] || ''
    return (first + second).toUpperCase()
  }

  const getColorFromName = (name: string) => {
    // Хэш -> стабильный цвет (пастельный). Генерируем из имени HEX.
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
    // Базовые компоненты 0..255
    let r = (hash & 0xFF)
    let g = ((hash >> 8) & 0xFF)
    let b = ((hash >> 16) & 0xFF)
    // Смягчим к пастельным: смешаем с белым
    const mix = (c: number) => Math.round((c + 255 + 255) / 3) // 2/3 к белому
    r = mix(r); g = mix(g); b = mix(b)
    const toHex = (c: number) => c.toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Разрешённые типы: JPG, PNG
    const allowedTypes = ['image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      setError('Поддерживаемые форматы: JPG, PNG')
      return
    }

    // Максимальный размер файла — 1 МБ
    const maxSize = 1 * 1024 * 1024
    if (file.size > maxSize) {
      setError('Максимальный размер файла: 1 МБ')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = async () => {
        const width = img.naturalWidth
        const height = img.naturalHeight

        // Убираем требование квадрата и минимального размера: допускаем любые пропорции

        // Если разрешение больше макс, уменьшаем (для JPEG/PNG), сохраняя пропорции
        const maxDim = 1920
        const needsResize = width > maxDim || height > maxDim

        const proceedWithFile = async (finalFile: File) => {
          setError('')
          const url = URL.createObjectURL(finalFile)
          setAvatar(url)
          setNewAvatar(finalFile)
        }

        if (needsResize) {
          try {
            const scale = Math.min(maxDim / width, maxDim / height)
            const targetW = Math.round(width * scale)
            const targetH = Math.round(height * scale)

            const canvas = document.createElement('canvas')
            canvas.width = targetW
            canvas.height = targetH
            const ctx = canvas.getContext('2d')
            if (!ctx) {
              setError('Не удалось обработать изображение. Попробуйте другое.')
              return
            }
            ctx.drawImage(img, 0, 0, targetW, targetH)

            const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
            const blob: Blob | null = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), mime, 0.9))
            if (!blob) {
              setError('Не удалось уменьшить изображение. Попробуйте другое.')
              return
            }
            // Проверим итоговый размер — всё ещё должен быть <= 1 МБ
            if (blob.size > maxSize) {
              setError('Даже после уменьшения размер превышает 1 МБ. Выберите другое изображение.')
              return
            }
            const resizedFile = new File([blob], file.name.replace(/\.(jpg|jpeg|png)$/i, '') + (mime === 'image/png' ? '.png' : '.jpg'), { type: mime })
            await proceedWithFile(resizedFile)
            return
          } catch (err) {
            console.error('Image resize error:', err)
            setError('Ошибка при обработке изображения. Попробуйте другое.')
            return
          }
        }

        // Всё ок, используем исходный файл
        proceedWithFile(file)
      }
      if (typeof reader.result === 'string') {
        img.src = reader.result
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!newAvatar) return

    setIsLoading(true)
    setError('')
    setSuccess('')
    
    try {
      await uploadAvatarFile(newAvatar)
      setNewAvatar(null)
      setSuccess('Ваше изображение успешно изменилось')
      // Авто-сокрытие флэша через 3 секунды
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Avatar upload error:', err)
      setError('Ошибка при загрузке аватарки')
    } finally {
      setIsLoading(false)
    }
  }

  // Name editing is disabled by requirements; only avatar can be changed

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="relative w-32 h-32 mx-auto">
            {hasRealAvatar ? (
              <>
                <NextImage
                  src={avatar}
                  alt="avatar"
                  fill
                  className="rounded-full object-cover border-4 border-white shadow-lg"
                  onError={() => setImageOk(false)}
                />
                <div className="absolute inset-0 rounded-full bg-black/0 hover:bg-black/30 transition-colors duration-200 flex items-center justify-center cursor-pointer">
                  <Camera className="text-white opacity-0 hover:opacity-100 transition-opacity" size={24} />
                </div>
              </>
            ) : (
              <div className="rounded-full border-4 border-white shadow-lg w-full h-full grid place-items-center text-white text-2xl font-semibold select-none" style={{ backgroundColor: getColorFromName(userName || 'User') }}>
                {getInitials(userName || 'U U')}
              </div>
            )}
          </div>
          <label className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer transition-colors">
            <Edit3 size={16} />
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png"
              onChange={(e) => { setImageOk(true); handleFileChange(e) }}
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
        <h4 className="font-medium text-gray-900 mb-2">Рекомендации для фото:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Поддерживаемые форматы: JPG, PNG</li>
          <li>• Максимальный размер файла: 1 МБ</li>
          <li>• Максимальное разрешение: 1920x1080 пикселей</li>
        </ul>
      </div>

      {(error || success) && (
        <div className={error ? 'bg-red-50 border border-red-200 rounded-lg p-4' : 'bg-green-50 border border-green-200 rounded-lg p-4'}>
          <p className={error ? 'text-sm text-red-600' : 'text-sm text-green-700'}>{error || success}</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          disabled={!newAvatar || isLoading}
          onClick={handleSave}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Загрузка...
            </>
          ) : (
            <>
              <Save size={16} />
              Сохранить
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function PasswordSection() {
  const { t } = useTranslation('common')
  const { user } = useAuth()
  const router = useRouter()
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

    // Усиленные требования к паролю
    const missingRequirements: string[] = []
    if (passwords.new.length < 8) missingRequirements.push('минимум 8 символов')
    if (!/\d/.test(passwords.new)) missingRequirements.push('хотя бы одна цифра')
    // Спецсимволы: включаем распространённые, в том числе из примера: ! " № ; % : ) (
    const specialRegex = /[!"№;%:\)\(\-_=+@#$^&*.,<>/?\\|{}\[\]]/
    if (!specialRegex.test(passwords.new)) missingRequirements.push('хотя бы один специальный символ (! " № ; %)')

    if (missingRequirements.length) {
      setMessage({ 
        type: 'error', 
        text: `Пароль не соответствует требованиям: ${missingRequirements.join('; ')}.` 
      })
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
      const isJson = contentType.includes('application/json')
      const payloadText = await resp.text().catch(() => '')
      const data = isJson ? (payloadText ? JSON.parse(payloadText) : null) : null
      if (!resp.ok) {
        // Специальный кейс: неверный текущий пароль
        if (resp.status === 400) {
          setMessage({ type: 'error', text: 'Вы ввели текущий пароль неверно.' })
          return
        }
        // Если пришёл JSON — пробуем собрать поля, иначе используем текст ответа
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
        const msg = compileErrors() || payloadText || 'Ошибка при смене пароля'
        setMessage({ type: 'error', text: msg })
      } else {
        // Успех: сообщаем и выполняем принудительный выход и редирект на логин
        setMessage({ type: 'success', text: 'Пароль успешно изменен' })
        setPasswords({ old: '', new: '', confirm: '' })
        try {
          // Очищаем локальный токен сразу
          localStorage.removeItem('auth.token')
          // Пытаемся корректно разлогиниться на бэкенде (если доступно)
          await AuthApi.logout().catch(() => {})
        } finally {
          // Редирект на страницу логина
          useRouter().push('/login')
        }
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
          <label className="block text sm font-medium text-gray-700 mb-2">
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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [backendEmail, setBackendEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const loadFromProfile = async () => {
    setIsLoading(true)
    try {
      const r = await fetch('/api/auth/profile', { cache: 'no-store' })
      const ct = r.headers.get('content-type') || ''
      const txt = await r.text().catch(() => '')
      const data = ct.includes('application/json') && txt ? JSON.parse(txt) : null
      if (r.ok && data) {
        const apiEmail = data.recovery_email || null
        setBackendEmail(apiEmail)
        setReserveEmail(apiEmail || '')
      } else {
        setBackendEmail(null)
      }
    } catch {
      setBackendEmail(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFromProfile()
  }, [])

  const saveReserveEmail = async () => {
    if (!reserveEmail) {
      setMessage({ type: 'error', text: 'Введите почту' })
      return
    }
    setIsSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/auth/change-recovery-email', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recovery_email: reserveEmail }),
        cache: 'no-store',
      })
      const contentType = res.headers.get('content-type') || ''
      const text = await res.text().catch(() => '')
      const data = contentType.includes('application/json') && text ? JSON.parse(text) : null
      if (!res.ok) {
        const msg = (data && (data.detail || data.message || data.error)) || text || 'Не удалось обновить резервную почту'
        setMessage({ type: 'error', text: String(msg) })
        return
      }
      await loadFromProfile()
      setMessage({ type: 'success', text: 'Резервная почта обновлена' })
    } catch (e: any) {
      setMessage({ type: 'error', text: 'Сервис недоступен. Попробуйте позже.' })
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
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 mt-1">Укажите резервную почту для восстановления доступа</p>
        {backendEmail && (
          <p className="text-xs text-gray-500 mt-1">Сохранено на сервере: {backendEmail}</p>
        )}
        {message && (
          <p className={`text-xs mt-2 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>
        )}
      </div>
      <div className="flex justify-end">
        <Button onClick={saveReserveEmail} className="flex items-center gap-2" disabled={isSaving || isLoading || !reserveEmail}>
          <Save size={16} />
          {isSaving ? 'Сохранение...' : backendEmail ? t('common.save') : 'Добавить'}
        </Button>
      </div>
    </div>
  )
}