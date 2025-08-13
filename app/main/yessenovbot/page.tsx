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

export default function YessenovBotPage() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [activeChat, setActiveChat] = useState<string>('default')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
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
      <div className="flex h-[calc(100vh-64px)] relative overflow-hidden">
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