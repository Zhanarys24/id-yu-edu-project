'use client'

import { PlusIcon } from '@heroicons/react/20/solid'
import Layout from '@/components/Layout'
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  UserIcon,
  DocumentIcon,
  ExclamationCircleIcon,
  LightBulbIcon,
  PaperClipIcon,
  TrashIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Send, Bot, Loader2 } from 'lucide-react'

type Message = {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

type AITab = 'yessenovai' | 'jolserik'

interface HelpCategory {
  id: string
  title: string
  desc: string
  icon: string
  color: string
  questions: string[]
}

// Добавляем интерфейсы в начало файла
interface KnowledgeItem {
  keywords: string[]
  answer: string
  category: string
}

export default function YessenovBotPage() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [activeChat, setActiveChat] = useState('default')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<AITab>('yessenovai')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Примеры чатов (в реальном приложении можно загружать из API)
  const chatHistory = {
    default: [],
    'chat-1': [
      { id: '1', text: t('yessenovai.sampleQuestion'), isUser: true, timestamp: new Date() },
      { id: '2', text: t('yessenovai.sampleAnswer'), isUser: false, timestamp: new Date() },
    ],
  }

  // Автопрокрутка к новым сообщениям
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Имитация ответа бота
    setTimeout(() => {
      const botResponsesRaw = t('yessenovai.botResponses', { returnObjects: true });

      // Гарантируем, что всегда будет массив строк
      const botResponses: string[] = Array.isArray(botResponsesRaw)
        ? botResponsesRaw
        : typeof botResponsesRaw === 'string'
          ? [botResponsesRaw]
          : ['Sorry, I am having trouble responding right now.'];

      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];

      const botMessage: Message = {
        id: Date.now().toString(),
        text: randomResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const createNewChat = () => {
    setActiveChat(`chat-${Date.now()}`)
    setMessages([])
    setIsSidebarOpen(false)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  const selectChat = (chatId: string) => {
    setActiveChat(chatId)
    if (chatId === 'chat-1') {
      setMessages(chatHistory['chat-1'])
    } else {
      setMessages([])
    }
    setIsSidebarOpen(false)
  }

// Безопасная обработка популярных вопросов
const popularQuestionsRaw = t('yessenovai.popularQuestions', { returnObjects: true }) ?? [];
const popularQuestions = Array.isArray(popularQuestionsRaw)
  ? popularQuestionsRaw
  : typeof popularQuestionsRaw === 'string'
    ? [popularQuestionsRaw]
    : [
        'How do I apply for admission?',
        'What documents do I need?',
        'When does the academic year start?',
        'How can I get a scholarship?'
      ];


  return (
    <Layout active={t('menu.yessenovai')}>
      {/* Вкладки AI */}
      <div className="bg-white border-b border-gray-200 mb-4">
        <div className="flex">
          <button
            onClick={() => setActiveTab('yessenovai')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'yessenovai'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            YessenovAI
          </button>
          <button
            onClick={() => setActiveTab('jolserik')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'jolserik'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Jolserik AI
          </button>
        </div>
      </div>

      {/* Контент в зависимости от активной вкладки */}
      {activeTab === 'yessenovai' ? (
        // Весь оригинальный код YessenovAI (не трогаем!)
        <div className="flex h-[calc(100vh-120px)] relative overflow-hidden">
          {/* Кнопка меню для мобильных */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-lg shadow-lg hover:bg-blue-700"
          >
            {isSidebarOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>

          {/* Overlay для мобильных */}
          {isSidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
              onClick={closeSidebar}
            />
          )}

          {/* Основной чат */}
          <div className="flex-1 bg-white p-3 sm:p-4 lg:p-6 rounded-none sm:rounded-xl shadow-none sm:shadow-sm flex flex-col overflow-hidden lg:mr-6">
            {/* Область сообщений */}
            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 mb-4 mt-12 lg:mt-0">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="bg-blue-100 p-3 sm:p-4 rounded-full mb-4">
                    <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                    {t('yessenovai.welcome')}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-md">
                    {t('yessenovai.description')}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 max-w-lg w-full">
                    <BotCard
                      title={t('yessenovai.cards.freshmen.title')}
                      desc={t('yessenovai.cards.freshmen.desc')}
                      icon={<UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />}
                      color="bg-blue-100"
                      onClick={() => setInput(t('yessenovai.cards.freshmen.question'))}
                    />
                    <BotCard
                      title={t('yessenovai.cards.documents.title')}
                      desc={t('yessenovai.cards.documents.desc')}
                      icon={<DocumentIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />}
                      color="bg-green-100"
                      onClick={() => setInput(t('yessenovai.cards.documents.question'))}
                    />
                    <BotCard
                      title={t('yessenovai.cards.academic.title')}
                      desc={t('yessenovai.cards.academic.desc')}
                      icon={<ExclamationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />}
                      color="bg-yellow-100"
                      onClick={() => setInput(t('yessenovai.cards.academic.question'))}
                    />
                    <BotCard
                      title={t('yessenovai.cards.content.title')}
                      desc={t('yessenovai.cards.content.desc')}
                      icon={<LightBulbIcon className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />}
                      color="bg-pink-100"
                      onClick={() => setInput(t('yessenovai.cards.content.question'))}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 sm:px-4 py-2 sm:py-3 ${
                          message.isUser
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm sm:text-base">{message.text}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none px-3 sm:px-4 py-2 sm:py-3 max-w-[85%] sm:max-w-[80%]">
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Форма ввода */}
            <div className="mt-auto pb-4 sm:pb-0">
              <div className="relative">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-full py-2 sm:py-3 px-3 sm:px-4 pr-10 sm:pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('yessenovai.inputPlaceholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={1000}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className={`absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 ${
                    isLoading || !input.trim() ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  <Send size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="flex justify-between items-center mt-2 mb-2 sm:mb-[10px] text-xs text-gray-500 px-1">
                <label className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                  <PaperClipIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <input type="file" className="hidden" />
                  <span className="text-xs">{t('yessenovai.attachFile')}</span>
                </label>
                <span className="text-xs">{input.length} / 1000</span>
              </div>
            </div>
          </div>

          {/* Боковая панель */}
          <div className={`
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            fixed lg:relative top-0 right-0 h-full lg:h-auto
            w-80 sm:w-72 lg:w-72 
            bg-white rounded-none lg:rounded-xl shadow-lg lg:shadow-sm 
            p-4 flex flex-col overflow-hidden
            transition-transform duration-300 ease-in-out
            z-40 lg:z-auto
          `}>
            <button
              onClick={createNewChat}
              className="w-full bg-blue-600 text-white rounded py-2 sm:py-2 mb-4 hover:bg-blue-700 text-sm flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              {t('yessenovai.newChat')}
            </button>
            
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {t('yessenovai.activeChats')}
              </h3>
              <ul className="space-y-1 mb-4">
                <li
                  className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                    activeChat === 'default' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => selectChat('default')}
                >
                  <span className="text-sm truncate">{t('yessenovai.newChatTitle')}</span>
                  {activeChat === 'default' && (
                    <TrashIcon className="w-4 h-4 text-gray-400 hover:text-red-500 flex-shrink-0" />
                  )}
                </li>
                <li
                  className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                    activeChat === 'chat-1' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => selectChat('chat-1')}
                >
                  <span className="text-sm truncate">{t('yessenovai.documentQuestions')}</span>
                  <TrashIcon className="w-4 h-4 text-gray-400 hover:text-red-500 flex-shrink-0" />
                </li>
              </ul>

              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {t('yessenovai.popularQuestionsTitle')}
              </h3>
              <ul className="text-sm space-y-2 text-gray-700">
                {popularQuestions.map((item, i) => (
                  <li
                    key={i}
                    className="cursor-pointer p-2 rounded hover:bg-gray-50 hover:text-blue-600 transition-colors truncate"
                    onClick={() => {
                      setInput(item)
                      setIsSidebarOpen(false)
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="bg-blue-100 p-1 rounded-full">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <span>{t('yessenovai.version')}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Новый контент для Jolserik AI
        <JolserikAIContent />
      )}
    </Layout>
  )
}

function BotCard({
  title,
  desc,
  icon,
  color,
  onClick,
}: {
  title: string
  desc: string
  icon: React.ReactNode
  color: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between gap-2 sm:gap-3 w-full p-2 sm:p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition text-left bg-white"
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-md flex items-center justify-center flex-shrink-0 ${color}`}>
          {icon}
        </div>
        <div className="text-sm min-w-0">
          <h3 className="font-medium text-gray-800 truncate">{title}</h3>
          <p className="text-gray-500 text-xs truncate">{desc}</p>
        </div>
      </div>
      <span className="text-gray-400 text-lg sm:text-xl flex-shrink-0">＋</span>
    </button>
  )
}

// Компонент для Jolserik AI
function JolserikAIContent() {
  const { t, i18n } = useTranslation('common')
  const [jolserikInput, setJolserikInput] = useState('')
  const [jolserikMessages, setJolserikMessages] = useState<Message[]>([])
  const [jolserikLoading, setJolserikLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Все функции должны быть ВНУТРИ JolserikAIContent
  const handleJolserikSend = async () => {
    if (!jolserikInput.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: jolserikInput,
      isUser: true,
      timestamp: new Date()
    }

    setJolserikMessages(prev => [...prev, userMessage])
    setJolserikInput('')
    setJolserikLoading(true)

    try {
      const response = await generateJolserikResponse(jolserikInput)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      }
      setJolserikMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error generating response:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Извините, произошла ошибка. Попробуйте еще раз.',
        isUser: false,
        timestamp: new Date()
      }
      setJolserikMessages(prev => [...prev, errorMessage])
    } finally {
      setJolserikLoading(false)
    }
  }

  const generateJolserikResponse = async (input: string): Promise<string> => {
    try {
      console.log('🤖 Jolserik AI: обрабатываю запрос:', input)
      
      // Используем наш умный чат API с передачей credentials
      const response = await fetch('/api/jolserik/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Передаем cookies
        body: JSON.stringify({
          message: input,
          studentId: 'current_user'
        })
      })

      console.log('📡 API ответ статус:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ API ответ получен:', data)
        return data.response || 'Получен пустой ответ от API'
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Ошибка API:', response.status, errorData)
        return getFallbackResponse(input)
      }

    } catch (error) {
      console.error('💥 Ошибка сети:', error)
      return getFallbackResponse(input)
    }
  }

  function getFallbackResponse(input: string): string {
    const lowerInput = input.toLowerCase()
    
    // Базовые ответы на случай проблем с API
    if (lowerInput.includes('деканат') || lowerInput.includes('деканaт')) {
      return `�� **Деканат**
      
📍 Местоположение: Главный корпус, 2 этаж, кабинеты 201-205
📞 Телефон: +7 (7292) 40-01-01
⏰ Время работы: Пн-Пт 9:00-17:00

💡 Если API временно недоступен, обратитесь напрямую!`
    }
    
    if (lowerInput.includes('расписание') || lowerInput.includes('кесте')) {
      return `📅 **Расписание**
      
🔄 API временно недоступен
💻 Проверьте расписание в Platonus: https://platonus.yu.edu.kz
�� Техподдержка: +7 (7292) 40-01-05

💡 Попробуйте спросить через несколько минут!`
    }
    
    if (lowerInput.includes('столовая') || lowerInput.includes('ас үй')) {
      return `🍽️ **Столовая**
      
📍 Главный корпус, 1 этаж
⏰ Время работы: 8:00-18:00
💳 Принимают: наличные, карты, студенческая карта`
    }
    
    return `�� **Извините, сейчас не могу обработать ваш запрос**

�� Возможные причины:
• API временно недоступен
• Проблемы с сетью
• Техническое обслуживание

📞 **Контакты для помощи:**
• Деканат: +7 (7292) 40-01-01
• IT-поддержка: +7 (7292) 40-01-05
• Студенческий отдел: +7 (7292) 40-01-04

💡 **Популярные вопросы:**
• "Где деканат?"
• "Расписание на сегодня"
• "Как получить справку?"

🔄 Попробуйте переформулировать вопрос!`
  }

  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category.id)
    const welcomeMessage = `${category.icon} **${category.title}**\n\nВыберите вопрос или задайте свой:\n\n${category.questions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}`
    
    const aiMessage: Message = {
      id: Date.now().toString(),
      text: welcomeMessage,
      isUser: false,
      timestamp: new Date()
    }
    setJolserikMessages([aiMessage])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleJolserikSend()
    }
  }

  // Статические категории (без переводов пока)
  const helpCategories = [
    {
      id: 'navigation',
      title: 'Навигация по кампусу',
      desc: 'Где находятся аудитории, деканат, столовая...',
      icon: '🗺️',
      color: 'bg-blue-100',
      questions: [
        'Где находится деканат?',
        'Как найти аудиторию 205?',
        'Где столовая в главном корпусе?',
        'Расположение библиотеки'
      ]
    },
    {
      id: 'schedule',
      title: 'Расписание занятий',
      desc: 'Узнать расписание, изменения, экзамены...',
      icon: '📅',
      color: 'bg-green-100',
      questions: [
        'Когда у меня следующая пара?',
        'Расписание на завтра',
        'Когда экзамены?',
        'Изменения в расписании'
      ]
    },
    {
      id: 'documents',
      title: 'Документы и заявки',
      desc: 'Справки, заявления, документы...',
      icon: '📄',
      color: 'bg-yellow-100',
      questions: [
        'Как получить справку об обучении?',
        'Подать заявление на стипендию',
        'Документы для общежития',
        'Академический отпуск'
      ]
    },
    {
      id: 'systems',
      title: 'Учебные системы',
      desc: 'Platonus, Canvas, электронная почта...',
      icon: '💻',
      color: 'bg-purple-100',
      questions: [
        'Как войти в Platonus?',
        'Проблемы с Canvas',
        'Настройка email студента',
        'Доступ к электронным ресурсам'
      ]
    },
    {
      id: 'adaptation',
      title: 'Адаптация в вузе',
      desc: 'Студенческая жизнь, клубы, мероприятия...',
      icon: '🎓',
      color: 'bg-pink-100',
      questions: [
        'Как записаться в студенческие клубы?',
        'Предстоящие мероприятия',
        'Студенческий совет',
        'Спортивные секции'
      ]
    },
    {
      id: 'emergency',
      title: 'Срочная помощь',
      desc: 'Контакты, экстренные ситуации...',
      icon: '🆘',
      color: 'bg-red-100',
      questions: [
        'Контакты деканата',
        'Техподдержка',
        'Медпункт университета',
        'Служба безопасности'
      ]
    }
  ]

  return (
    <div className="flex h-[calc(100vh-120px)] relative overflow-hidden">
      <div className="flex-1 bg-white p-3 sm:p-4 lg:p-6 rounded-xl shadow-sm flex flex-col overflow-hidden">
        {/* Область сообщений */}
        <div className="flex-1 overflow-y-auto pr-2 mb-4">
          {jolserikMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <Bot className="w-8 h-8 text-purple-600" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                Добро пожаловать в Jolserik AI
              </h1>
              <p className="text-base text-gray-500 mb-8 max-w-md">
                Ваш персональный помощник для адаптации в университете. Выберите категорию помощи:
              </p>
              
              {/* Категории помощи */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-4xl">
                {helpCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className={`p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all text-left ${category.color}`}
                  >
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <h3 className="font-semibold text-gray-800 mb-1">{category.title}</h3>
                    <p className="text-sm text-gray-600">{category.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {jolserikMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.isUser
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {jolserikLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Форма ввода */}
        <div className="mt-auto">
          <div className="relative">
            <input
              type="text"
              className="w-full border border-gray-300 rounded-full py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Задайте вопрос Jolserik AI..."
              value={jolserikInput}
              onChange={(e) => setJolserikInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={1000}
            />
            <button
              onClick={handleJolserikSend}
              disabled={jolserikLoading || !jolserikInput.trim()}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                jolserikLoading || !jolserikInput.trim() ? 'text-gray-400' : 'text-purple-600 hover:text-purple-800'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
          
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <button 
              onClick={() => {setJolserikMessages([]); setSelectedCategory(null)}}
              className="text-purple-600 hover:text-purple-800"
            >
              🔄 Новый разговор
            </button>
            <span>{jolserikInput.length} / 1000</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Вспомогательные функции вне компонента
function detectLanguage(input: string): 'ru' | 'kz' | 'en' {
  const kazakhWords = ['қайда', 'қалай', 'неше', 'қашан', 'кім', 'не', 'деканат', 'аудитория', 'кесте']
  const englishWords = ['where', 'how', 'when', 'what', 'who', 'schedule', 'dean', 'office', 'classroom']
  
  const lowerInput = input.toLowerCase()
  
  if (kazakhWords.some(word => lowerInput.includes(word))) return 'kz'
  if (englishWords.some(word => lowerInput.includes(word))) return 'en'
  return 'ru'
}

function findMultilingualResponse(input: string, language: 'ru' | 'kz' | 'en'): string | null {
  const lowerInput = input.toLowerCase()

  // Деканат
  if (lowerInput.includes('деканат') || lowerInput.includes('dean')) {
    const responses = {
      ru: `🗺️ **Деканат** находится в главном корпусе, 2 этаж, кабинеты 201-205.\n\n📍 Как добраться:\n• Войдите в главный вход\n• Поднимитесь на 2 этаж\n• Поверните направо\n\n🕒 Время: Пн-Пт 9:00-17:00\n📞 Телефон: +7 (7292) 40-01-01`,
      kz: `🗺️ **Деканат** негізгі корпуста, 2 қабат, 201-205 кабинеттерде орналасқан.\n\n📍 Қалай бару:\n• Негізгі кіреберістен кіріңіз\n• 2 қабатқа көтеріліңіз\n• Оңға бұрылыңыз\n\n🕒 Уақыт: Дс-Жм 9:00-17:00\n📞 Телефон: +7 (7292) 40-01-01`,
      en: `🗺️ **Dean's Office** is located in the main building, 2nd floor, offices 201-205.\n\n📍 How to get there:\n• Enter through main entrance\n• Go to 2nd floor\n• Turn right\n\n🕒 Hours: Mon-Fri 9:00-17:00\n📞 Phone: +7 (7292) 40-01-01`
    }
    return responses[language]
  }

  return null
}

function formatScheduleResponse(classes: any[], language: 'ru' | 'kz' | 'en'): string {
  const schedule = classes
    .map(cls => `${cls.time} - ${cls.subject} (${cls.teacher}, ${cls.room})`)
    .join('\n')

  const headers = {
    ru: `📅 **Ваше расписание на сегодня:**\n\n${schedule}`,
    kz: `📅 **Бүгінгі сабақ кестеңіз:**\n\n${schedule}`,
    en: `📅 **Your schedule for today:**\n\n${schedule}`
  }

  return headers[language]
}

function getMultilingualFallback(language: 'ru' | 'kz' | 'en'): string {
  const fallbacks = {
    ru: `👋 Привет! Я Jolserik AI - твой помощник для адаптации в университете.\n\nЗадайте любой вопрос!`,
    kz: `👋 Сәлем! Мен Jolserik AI - университетте бейімделуге көмекшімін.\n\nКез келген сұрақ қойыңыз!`,
    en: `👋 Hello! I'm Jolserik AI - your university adaptation assistant.\n\nAsk me anything!`
  }
  return fallbacks[language]
}