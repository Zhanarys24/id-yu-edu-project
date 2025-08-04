'use client'

/**
 * Импорт иконок и компонентов
 */
import { PlusIcon } from '@heroicons/react/20/solid'
import Layout from '@/components/Layout'
import { useState } from 'react'
import {
  UserIcon,
  DocumentIcon,
  ExclamationCircleIcon,
  LightBulbIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline'
import { Send } from 'lucide-react'

/**
 * Главная страница бота
 */
export default function YessenovBotPage() {
  const [input, setInput] = useState('Где можно получить справку об учёбе?') // состояние инпута

  return (
    <Layout active="YessenovBot"> {/* Обёртка Layout со включенной навигацией */}
      
      <div className="flex h-[calc(100vh-64px)] gap-6 overflow-hidden">
        
        {/* === Левая основная часть === */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-sm flex flex-col overflow-hidden">

          {/* Введение: заголовок, описание и карточки */}
          <div className="overflow-y-auto pr-2 mb-4 flex flex-col items-center text-center">
            <h1 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">
              Добро пожаловать в YessenovBot
            </h1>
            <p className="text-gray-500 mb-8 max-w-md">
              Ваш личный ИИ-ассистент для быстрых ответов и поддержки. Начнём?
            </p>

            {/* 4 карточки с типами вопросов (в 2x2 сетке) */}
            <div className="grid grid-cols-2 gap-4 mb-6 max-w-lg w-full">
              <BotCard
                title="Помощь первокурсникам"
                desc="Где корпуса, куда обращаться..."
                icon={<UserIcon className="w-5 h-5 text-blue-600" />}
                color="bg-blue-100"
              />
              <BotCard
                title="Оформление документов"
                desc="Справки, заявления..."
                icon={<DocumentIcon className="w-5 h-5 text-green-600" />}
                color="bg-green-100"
              />
              <BotCard
                title="Академвопросы"
                desc="Задолженности, экзамены..."
                icon={<ExclamationCircleIcon className="w-5 h-5 text-yellow-600" />}
                color="bg-yellow-100"
              />
              <BotCard
                title="Генерация контента"
                desc="Темы дипломов..."
                icon={<LightBulbIcon className="w-5 h-5 text-pink-600" />}
                color="bg-pink-100"
              />
            </div>
          </div>

          {/* Нижняя часть: форма ввода запроса */}
          <div className="mt-auto">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-full py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите сообщение..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={1000}
              />
              {/* Кнопка отправки (иконка самолёта) */}
              <button
                onClick={() => {
                  if (input.trim()) {
                    console.log('Отправлено:', input)
                    setInput('')
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
              >
                <Send size={20} />
              </button>
            </div>

            {/* Панель под инпутом: прикрепление файла + счётчик символов */}
            <div className="flex justify-between items-center mt-2 mb-[10px] text-xs text-gray-500 px-1">
              <label className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                <PaperClipIcon className="w-4 h-4" />
                <input type="file" className="hidden" />
                <span>Прикрепить файл</span>
              </label>
              <span>{input.length} / 1000</span>
            </div>
          </div>
        </div>

        {/* === Правая боковая панель === */}
        <div className="w-72 bg-white rounded-xl shadow-sm p-4 flex flex-col overflow-hidden">
          {/* Кнопка нового чата */}
          <button className="w-full bg-blue-600 text-white rounded py-2 mb-4 hover:bg-blue-700 text-sm">
            + Новый чат
          </button>
          
          {/* Список быстрых тем (предыдущих или популярных вопросов) */}
          <ul className="text-sm space-y-3 text-gray-700 overflow-y-auto pr-1 flex-1">
            {[
              'Где узнать сроки сессии?',
              'Заявление на стипендию',
              'Местоположение корпу...',
              'Задолженность по пред...',
              'Расписание занятий',
              'Как получить ID-карту?',
              'Где кабинет деканата?',
              'Как получить справку?',
              'Как восстановить пароль?',
              'Какие есть кружки?',
            ].map((item, i) => (
              <li
                key={i}
                className="cursor-pointer hover:underline transition-colors"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  )
}

/**
 * Компонент карточки в левой части (иконка + текст + цвет)
 */
function BotCard({
  title,
  desc,
  icon,
  color
}: {
  title: string
  desc: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <button className="flex items-center justify-between gap-3 w-full p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition text-left bg-white">
      <div className="flex items-center gap-3">
        {/* Иконка с цветной подложкой */}
        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {/* Название и описание */}
        <div className="text-sm">
          <h3 className="font-medium text-gray-800">{title}</h3>
          <p className="text-gray-500 text-xs">{desc}</p>
        </div>
      </div>
      {/* Плюс справа */}
      <span className="text-gray-400 text-xl">＋</span>
    </button>
  )
}
