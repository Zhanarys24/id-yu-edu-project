'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { AuthApi } from '@/lib/services/authApi'

// Тип для данных профиля
interface ProfileData {
  birth_date?: string;
  first_name?: string;
  [key: string]: unknown;
}

export default function BirthdayNotification() {
  const { user } = useAuth()
  const [notification, setNotification] = useState<{
    show: boolean
    message: string
    userName: string
  } | null>(null)

  useEffect(() => {
    const checkBirthday = async () => {
      if (!user) return

      try {
        // Получаем данные профиля из API
        const profileData = await AuthApi.profile() as ProfileData
        
        // Проверяем, что profileData является объектом и содержит birth_date
        if (profileData && typeof profileData === 'object' && profileData.birth_date) {
          const birthDate = new Date(profileData.birth_date)
          const today = new Date()
          
          // Проверяем, что дата рождения валидна
          if (isNaN(birthDate.getTime())) {
            console.warn('Неверный формат даты рождения:', profileData.birth_date)
            return
          }
          
          // Проверяем, совпадает ли день и месяц
          const isBirthdayToday = 
            birthDate.getDate() === today.getDate() && 
            birthDate.getMonth() === today.getMonth()
          
          if (isBirthdayToday) {
            // Проверяем, не показывали ли мы уже уведомление сегодня
            const lastShown = localStorage.getItem('birthday-notification-shown')
            const todayString = today.toDateString()
            
            if (lastShown !== todayString) {
              const firstName = profileData.first_name || user.name?.split(' ')[0] || 'Дорогой пользователь'
              
              setNotification({
                show: true,
                message: `🎉 С Днем Рождения, ${firstName}! Yessenov University поздравляет вас и желает успехов в учебе и достижения всех целей!`,
                userName: firstName
              })
              
              // Сохраняем, что уведомление показано сегодня
              localStorage.setItem('birthday-notification-shown', todayString)
            }
          }
        }
      } catch (error) {
        console.error('Ошибка при проверке дня рождения:', error)
      }
    }

    checkBirthday()
  }, [user])

  const dismissNotification = () => {
    setNotification(null)
  }

  if (!notification?.show) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl shadow-2xl p-6 animate-[slideIn_0.3s_ease-out]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🎂</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">С Днем Рождения!</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              {notification.message}
            </p>
          </div>
          <button
            onClick={dismissNotification}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Закрыть уведомление"
          >
            ✕
          </button>
        </div>
        
        {/* Декоративные элементы */}
        <div className="absolute top-2 right-2 text-2xl opacity-20">🎉</div>
        <div className="absolute bottom-2 left-2 text-xl opacity-20"></div>
      </div>
      
      <style jsx global>{`
        @keyframes slideIn {
          from { 
            transform: translateX(100%); 
            opacity: 0; 
          }
          to { 
            transform: translateX(0); 
            opacity: 1; 
          }
        }
      `}</style>
    </div>
  )
}
