'use client'

import { useState, useEffect } from 'react'
import { Bell, X, CheckCircle, AlertCircle, Info, Star, Clock } from 'lucide-react'

type Notification = {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'birthday'
  timestamp: string
  read: boolean
  category: 'news' | 'system' | 'education' | 'event'
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Имитация загрузки уведомлений
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Добро пожаловать в Yessenov University!',
        message: 'Мы рады приветствовать вас в нашей образовательной системе. Ознакомьтесь с новыми возможностями.',
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        category: 'system'
      },
      {
        id: '2',
        title: 'Новые курсы доступны',
        message: 'Открыта запись на новые курсы по программированию и дизайну. Успейте записаться!',
        type: 'success',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        category: 'education'
      },
      {
        id: '3',
        title: 'Хакатон "Digital Future"',
        message: 'Приглашаем всех студентов принять участие в хакатоне по разработке инновационных решений.',
        type: 'warning',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: true,
        category: 'event'
      },
      {
        id: '4',
        title: 'С Днем Рождения! 🎉',
        message: 'Yessenov University поздравляет вас и желает успехов в учебе и достижения всех целей!',
        type: 'birthday',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        read: false,
        category: 'system'
      }
    ]
    
    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'birthday':
        return <Star className="w-5 h-5 text-pink-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'birthday':
        return 'border-l-pink-500 bg-pink-50'
      default:
        return 'border-l-blue-500 bg-blue-50'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Только что'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`
    return date.toLocaleDateString('ru-RU')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Кнопка открытия модалки */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="relative bg-white hover:bg-gray-50 text-gray-800 px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 group"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <div className="text-left">
            <div className="font-semibold text-lg">Уведомления</div>
            <div className="text-sm text-gray-600">
              {unreadCount > 0 ? `${unreadCount} непрочитанных` : 'Все прочитано'}
            </div>
          </div>
        </div>
      </button>

      {/* Модалка уведомлений */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Заголовок */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Уведомления</h2>
                    <p className="text-blue-100 text-sm">
                      {unreadCount > 0 ? `${unreadCount} непрочитанных` : 'Все уведомления прочитаны'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Содержимое */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Уведомлений пока нет</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md ${
                        notification.read ? 'opacity-75' : ''
                      } ${getNotificationColor(notification.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h3 className={`font-semibold text-gray-900 ${
                              notification.read ? '' : 'font-bold'
                            }`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                Отметить прочитанным
                              </button>
                            )}
                          </div>
                          <p className="text-gray-700 mt-1 text-sm leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(notification.timestamp)}</span>
                            <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                              {notification.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Футер */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    onClick={markAllAsRead}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline transition-colors"
                  >
                    Отметить все прочитанными
                  </button>
                  <div className="text-sm text-gray-500">
                    Всего: {notifications.length}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
