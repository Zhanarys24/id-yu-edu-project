import React, { useState } from 'react'
import { Bell } from 'lucide-react'

const initialNotifications = [
  { id: 1, text: 'Новое сообщение от Алексея' },
  { id: 2, text: 'Обновлен статус заказа' },
  { id: 3, text: 'Напоминание о встрече завтра' },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)

  const toggleModal = () => setIsOpen(!isOpen)

  const clearNotifications = () => setNotifications([])

  return (
    <div className="relative flex justify-end items-center gap-4">
      <Bell
        className="w-5 h-5 text-gray-500 cursor-pointer"
        onClick={toggleModal}
      />

      <select className="text-sm border border-gray-300 rounded px-2 py-1">
        <option>Русский</option>
        <option>Қазақша</option>
        <option>English</option>
      </select>

      {/* Модальное окно */}
      {isOpen && (
        <div
          className="fixed top-[60px] right-30 w-64 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-96 overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-4">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm">Уведомления отсутствуют</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="border-b border-gray-200 py-2 text-sm">
                  {n.text}
                </div>
              ))
            )}
          </div>

          <div className="flex justify-between items-center border-t border-gray-200 px-4 py-2">
            <button
              onClick={clearNotifications}
              className="text-red-500 text-xs hover:underline"
            >
              Очистить все
            </button>
            <button
              onClick={() => alert('Переход к просмотру всех уведомлений')}
              className="text-blue-600 text-xs hover:underline"
            >
              Посмотреть больше
            </button>
          </div>
        </div>
      )}

      {/* Закрытие модалки при клике вне */}
      {isOpen && (
        <div
          className="fixed inset-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
