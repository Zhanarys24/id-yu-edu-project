'use client'

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Calendar, Clock, MapPin, Users, Star, Trophy, Gift, Flame, Bell, BellOff, Eye, EyeOff, Filter, Search, ChevronLeft, ChevronRight, Plus, ExternalLink, Share2 } from "lucide-react"

// Types for events
export type EventCategory = 'academic' | 'social' | 'sports' | 'cultural' | 'workshop' | 'competition' | 'special'
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
export type ParticipationStatus = 'not_registered' | 'registered' | 'attending' | 'completed' | 'missed'

export interface GameEvent {
  id: string
  title: string
  description: string
  longDescription?: string
  category: EventCategory
  status: EventStatus
  startDate: string
  endDate: string
  location: string
  maxParticipants?: number
  currentParticipants: number
  organizer: string
  image?: string
  rewards: {
    coins: number
    xp: number
    items?: string[]
    achievements?: string[]
  }
  requirements?: {
    minLevel?: number
    achievements?: string[]
    items?: string[]
  }
  participationStatus: ParticipationStatus
  featured: boolean
  registrationDeadline?: string
  tags: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  isRepeating?: boolean
  repeatPattern?: string
  relatedQuests?: string[]
}

// Card components (reusing from AchievementSystem)
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

const Card = ({ children, className = "", hover = true, ...rest }: CardProps) => (
  <div {...rest} className={`rounded-2xl border border-gray-100 bg-white shadow-sm ${hover ? 'hover:shadow-xl hover:scale-[1.02]' : ''} transition-all duration-300 ${className}`}>
    {children}
  </div>
)

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

const CardHeader = ({ children, className = "" }: CardHeaderProps) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
)

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

const CardTitle = ({ children, className = "" }: CardTitleProps) => (
  <h3 className={`text-xl font-bold text-gray-800 ${className}`}>
    {children}
  </h3>
)

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

const CardContent = ({ children, className = "" }: CardContentProps) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
)

// Event status badge
const StatusBadge = ({ status }: { status: EventStatus }) => {
  const statusConfig = {
    upcoming: { color: 'from-blue-400 to-blue-600', text: 'Предстоит', icon: '🕐' },
    ongoing: { color: 'from-green-400 to-green-600', text: 'Идет сейчас', icon: '🔴' },
    completed: { color: 'from-gray-400 to-gray-600', text: 'Завершено', icon: '✅' },
    cancelled: { color: 'from-red-400 to-red-600', text: 'Отменено', icon: '❌' }
  }
  
  const config = statusConfig[status]
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </span>
  )
}

// Difficulty badge
const DifficultyBadge = ({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) => {
  const difficultyConfig = {
    easy: { color: 'bg-green-100 text-green-800', text: 'Легко', icon: '🟢' },
    medium: { color: 'bg-yellow-100 text-yellow-800', text: 'Средне', icon: '🟡' },
    hard: { color: 'bg-red-100 text-red-800', text: 'Сложно', icon: '🔴' }
  }
  
  const config = difficultyConfig[difficulty]
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </span>
  )
}

// Event card component
const EventCard = ({ 
  event, 
  onRegister, 
  onViewDetails 
}: { 
  event: GameEvent
  onRegister: (eventId: string) => void
  onViewDetails: (event: GameEvent) => void
}) => {
  const isUpcoming = event.status === 'upcoming'
  const isOngoing = event.status === 'ongoing'
  const canRegister = isUpcoming && event.participationStatus === 'not_registered'
  const isRegistered = ['registered', 'attending'].includes(event.participationStatus)
  const spotsLeft = event.maxParticipants ? event.maxParticipants - event.currentParticipants : null
  const isFull = spotsLeft !== null && spotsLeft <= 0

  const categoryIcons = {
    academic: '📚',
    social: '👥',
    sports: '⚽',
    cultural: '🎨',
    workshop: '🛠️',
    competition: '🏆',
    special: '⭐'
  }

  const timeUntilStart = new Date(event.startDate).getTime() - Date.now()
  const isStartingSoon = timeUntilStart > 0 && timeUntilStart < 24 * 60 * 60 * 1000 // 24 hours

  return (
    <Card 
      className={`group transition-all duration-300 ${
        event.featured ? 'ring-2 ring-purple-300 ring-opacity-50' : ''
      } ${
        isOngoing ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : ''
      }`}
    >
      <CardContent className="p-0">
        {/* Image header */}
        {event.image && (
          <div className="relative h-48 rounded-t-2xl overflow-hidden">
            <Image 
              src={event.image} 
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute top-4 left-4 flex gap-2">
              <StatusBadge status={event.status} />
              {event.featured && (
                <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  ⭐ Рекомендуемое
                </span>
              )}
            </div>
            {isStartingSoon && (
              <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                🔥 Скоро начало!
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{categoryIcons[event.category]}</span>
                <span className="text-sm text-gray-500 font-medium capitalize">{event.category}</span>
                <DifficultyBadge difficulty={event.difficulty} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                {event.title}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">{event.description}</p>

          {/* Event details */}
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>
                {new Date(event.startDate).toLocaleDateString('ru')} в {new Date(event.startDate).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {event.endDate !== event.startDate && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>
                  До {new Date(event.endDate).toLocaleDateString('ru')} {new Date(event.endDate).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>
                {event.currentParticipants} участников
                {event.maxParticipants && ` / ${event.maxParticipants}`}
                {spotsLeft !== null && spotsLeft > 0 && (
                  <span className="text-orange-600 font-semibold"> (осталось {spotsLeft})</span>
                )}
                {isFull && <span className="text-red-600 font-semibold"> (мест нет)</span>}
              </span>
            </div>
          </div>

          {/* Rewards */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-3 mb-4 border border-amber-200">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Image src="/YU-coin.png" alt="YU coin" width={16} height={16} className="w-4 h-4" />
                <span className="font-semibold text-amber-600">{event.rewards.coins} YU-coins</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-blue-500" />
                <span>{event.rewards.xp} XP</span>
              </div>
              {event.rewards.achievements && event.rewards.achievements.length > 0 && (
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-purple-500" />
                  <span className="text-purple-600">Достижения</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {canRegister && !isFull && (
              <button
                onClick={() => onRegister(event.id)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Записаться
              </button>
            )}
            {isRegistered && (
              <button
                disabled
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-bold"
              >
                ✓ Записан
              </button>
            )}
            {isFull && canRegister && (
              <button
                disabled
                className="flex-1 bg-gray-300 text-gray-600 py-3 px-4 rounded-xl font-bold cursor-not-allowed"
              >
                Мест нет
              </button>
            )}
            <button
              onClick={() => onViewDetails(event)}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>

          {/* Tags */}
          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {event.tags.slice(0, 3).map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
              {event.tags.length > 3 && (
                <span className="text-gray-400 text-xs">+{event.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Event details modal
const EventModal = ({ 
  event, 
  onClose, 
  onRegister 
}: { 
  event: GameEvent | null
  onClose: () => void
  onRegister: (eventId: string) => void 
}) => {
  if (!event) return null

  const canRegister = event.status === 'upcoming' && event.participationStatus === 'not_registered'
  const isRegistered = ['registered', 'attending'].includes(event.participationStatus)
  const spotsLeft = event.maxParticipants ? event.maxParticipants - event.currentParticipants : null
  const isFull = spotsLeft !== null && spotsLeft <= 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Header with image */}
          {event.image && (
            <div className="relative h-64 rounded-t-2xl overflow-hidden">
              <Image 
                src={event.image} 
                alt={event.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              <div className="absolute top-4 left-4 flex gap-2">
                <StatusBadge status={event.status} />
                {event.featured && (
                  <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    ⭐ Рекомендуемое
                  </span>
                )}
              </div>
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black bg-opacity-50 text-white flex items-center justify-center hover:bg-opacity-70 transition-colors"
              >
                ×
              </button>
            </div>
          )}

          {!event.image && (
            <div className="flex justify-between items-start p-6 pb-4 border-b">
              <h3 className="text-2xl font-bold text-gray-800">Детали события</h3>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
          )}

          <div className="p-6">
            {/* Title and basic info */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{event.category === 'academic' ? '📚' : event.category === 'social' ? '👥' : event.category === 'sports' ? '⚽' : event.category === 'cultural' ? '🎨' : event.category === 'workshop' ? '🛠️' : event.category === 'competition' ? '🏆' : '⭐'}</span>
                <span className="text-sm text-gray-500 font-medium capitalize">{event.category}</span>
                <DifficultyBadge difficulty={event.difficulty} />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-3">{event.title}</h1>
              <p className="text-gray-600 text-lg">{event.longDescription || event.description}</p>
            </div>

            {/* Event details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">📅 Дата и время</h4>
                  <div className="text-gray-600">
                    <div>Начало: {new Date(event.startDate).toLocaleDateString('ru')} в {new Date(event.startDate).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}</div>
                    {event.endDate !== event.startDate && (
                      <div>Конец: {new Date(event.endDate).toLocaleDateString('ru')} в {new Date(event.endDate).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">📍 Место проведения</h4>
                  <p className="text-gray-600">{event.location}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">👤 Организатор</h4>
                  <p className="text-gray-600">{event.organizer}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">👥 Участники</h4>
                  <div className="text-gray-600">
                    <div>{event.currentParticipants} записались</div>
                    {event.maxParticipants && (
                      <div>Максимум: {event.maxParticipants}</div>
                    )}
                    {spotsLeft !== null && (
                      <div className={spotsLeft > 10 ? 'text-green-600' : spotsLeft > 0 ? 'text-orange-600' : 'text-red-600'}>
                        {spotsLeft > 0 ? `Осталось мест: ${spotsLeft}` : 'Мест нет'}
                      </div>
                    )}
                  </div>
                </div>

                {event.registrationDeadline && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">⏰ Регистрация до</h4>
                    <p className="text-gray-600">{new Date(event.registrationDeadline).toLocaleDateString('ru')}</p>
                  </div>
                )}

                {event.requirements && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">⚠️ Требования</h4>
                    <div className="text-gray-600 space-y-1">
                      {event.requirements.minLevel && (
                        <div>Минимальный уровень: {event.requirements.minLevel}</div>
                      )}
                      {event.requirements.achievements && event.requirements.achievements.length > 0 && (
                        <div>Достижения: {event.requirements.achievements.join(', ')}</div>
                      )}
                      {event.requirements.items && event.requirements.items.length > 0 && (
                        <div>Предметы: {event.requirements.items.join(', ')}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rewards */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">🎁 Награды</h4>
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Image src="/YU-coin.png" alt="YU coin" width={20} height={20} className="w-5 h-5" />
                    <span className="font-semibold text-amber-600">{event.rewards.coins} YU-coins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-blue-500" />
                    <span>{event.rewards.xp} XP</span>
                  </div>
                  {event.rewards.achievements && event.rewards.achievements.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-purple-500" />
                      <span className="text-purple-600">Достижения</span>
                    </div>
                  )}
                  {event.rewards.items && event.rewards.items.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-green-500" />
                      <span className="text-green-600">Предметы</span>
                    </div>
                  )}
                </div>
                {event.rewards.items && event.rewards.items.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Предметы: {event.rewards.items.join(', ')}
                  </div>
                )}
                {event.rewards.achievements && event.rewards.achievements.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Достижения: {event.rewards.achievements.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {event.tags.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">🏷️ Теги</h4>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              {canRegister && !isFull && (
                <button
                  onClick={() => {
                    onRegister(event.id)
                    onClose()
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Записаться на событие
                </button>
              )}
              {isRegistered && (
                <button
                  disabled
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-bold"
                >
                  ✓ Вы записаны
                </button>
              )}
              {isFull && canRegister && (
                <button
                  disabled
                  className="flex-1 bg-gray-300 text-gray-600 py-3 px-6 rounded-xl font-bold cursor-not-allowed"
                >
                  Мест нет
                </button>
              )}
              <button
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                title="Поделиться"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mini calendar component
const MiniCalendar = ({ 
  events, 
  selectedDate, 
  onDateSelect 
}: { 
  events: GameEvent[]
  selectedDate: Date
  onDateSelect: (date: Date) => void 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate).toDateString()
      return eventDate === date.toDateString()
    })
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {currentMonth.toLocaleDateString('ru', { month: 'long', year: 'numeric' })}
          </CardTitle>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-1 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-1 rounded-lg hover:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map(day => (
            <div key={day} className="text-xs font-semibold text-gray-500 p-2">
              {day}
            </div>
          ))}
          {days.map((day, index) => {
            if (!day) return <div key={index} className="p-2"></div>
            
            const dayEvents = getEventsForDate(day)
            const isSelected = day.toDateString() === selectedDate.toDateString()
            const isToday = day.toDateString() === new Date().toDateString()
            
            return (
              <button
                key={day.getTime()}
                onClick={() => onDateSelect(day)}
                className={`p-2 text-sm rounded-lg hover:bg-gray-100 transition-colors relative ${
                  isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''
                } ${
                  isToday && !isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : ''
                }`}
              >
                {day.getDate()}
                {dayEvents.length > 0 && (
                  <div className={`absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                    isSelected ? 'bg-white' : 'bg-blue-500'
                  }`}></div>
                )}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Main events component
interface UserStats {
  level: number
  xp: number
  events?: Event[]
  questsCompleted?: number
  attendanceStreak?: number
  friendsCount?: number
  totalCoinsEarned?: number
}


export default function EventSystem({ userStats }: { userStats: UserStats }) {
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all')
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'my_events'>('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<'grid' | 'calendar' | 'list'>('grid')
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Mock events data - в реальном приложении это будет из API/локального хранилища
  const [events, setEvents] = useState<GameEvent[]>([
    {
      id: 'hackathon2024',
      title: 'YU Hackathon 2024',
      description: 'Крупнейший хакатон университета. Создайте инновационное решение за 48 часов!',
      longDescription: 'Присоединяйтесь к самому масштабному хакатону университета Есенова! За 48 часов участники создадут инновационные решения для реальных задач. Команды из 2-4 человек, менторская поддержка, призы и возможности для стажировок.',
      category: 'competition',
      status: 'upcoming',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 дней от сегодня
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 дней от сегодня
      location: 'Главный корпус, IT-лаборатория',
      maxParticipants: 120,
      currentParticipants: 87,
      organizer: 'Факультет информационных технологий',
      image: '/events/hackathon.jpg',
      rewards: {
        coins: 5000,
        xp: 2500,
        items: ['Диплом участника', 'Футболка YU Hackathon'],
        achievements: ['Участник хакатона', 'Инноватор']
      },
      participationStatus: 'not_registered',
      featured: true,
      registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['программирование', 'инновации', 'командная работа', 'стартап'],
      difficulty: 'hard'
    },
    {
      id: 'career_fair',
      title: 'Ярмарка карьеры',
      description: 'Встреча с ведущими работодателями региона. Возможности для стажировок и трудоустройства.',
      category: 'academic',
      status: 'upcoming',
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(), // 8 часов
      location: 'Актовый зал',
      maxParticipants: 500,
      currentParticipants: 234,
      organizer: 'Отдел карьеры и трудоустройства',
      rewards: {
        coins: 1000,
        xp: 500
      },
      participationStatus: 'registered',
      featured: false,
      tags: ['карьера', 'работа', 'стажировка', 'нетворкинг'],
      difficulty: 'easy'
    },
    {
      id: 'student_conference',
      title: 'Студенческая научная конференция',
      description: 'Презентация исследовательских работ студентов. Обмен опытом и знаниями.',
      category: 'academic',
      status: 'ongoing',
      startDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 часа назад
      endDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // через 6 часов
      location: 'Конференц-зал',
      currentParticipants: 78,
      organizer: 'Научная часть',
      rewards: {
        coins: 1500,
        xp: 750,
        achievements: ['Участник конференции']
      },
      participationStatus: 'attending',
      featured: true,
      tags: ['наука', 'исследования', 'презентации'],
      difficulty: 'medium'
    },
    {
      id: 'photography_workshop',
      title: 'Мастер-класс по фотографии',
      description: 'Изучите основы профессиональной фотографии с известным фотографом.',
      category: 'workshop',
      status: 'upcoming',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
      location: 'Студия творчества',
      maxParticipants: 25,
      currentParticipants: 18,
      organizer: 'Студенческий клуб',
      rewards: {
        coins: 800,
        xp: 400,
        items: ['Сертификат участника']
      },
      participationStatus: 'not_registered',
      featured: false,
      tags: ['фотография', 'творчество', 'мастер-класс'],
      difficulty: 'easy'
    },
    {
      id: 'sports_tournament',
      title: 'Турнир по футболу',
      description: 'Межфакультетский турнир по футболу. Покажите командный дух!',
      category: 'sports',
      status: 'upcoming',
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Спортивный комплекс',
      maxParticipants: 160,
      currentParticipants: 120,
      organizer: 'Спортивный клуб',
      rewards: {
        coins: 2000,
        xp: 1000,
        achievements: ['Спортсмен', 'Командный игрок']
      },
      participationStatus: 'not_registered',
      featured: false,
      tags: ['футбол', 'спорт', 'команда', 'турнир'],
      difficulty: 'medium'
    }
  ])

  const categories = [
    { id: 'all' as const, name: 'Все', icon: Calendar, count: events.length },
    { id: 'academic' as const, name: 'Учеба', icon: '📚', count: events.filter(e => e.category === 'academic').length },
    { id: 'social' as const, name: 'Социальные', icon: '👥', count: events.filter(e => e.category === 'social').length },
    { id: 'sports' as const, name: 'Спорт', icon: '⚽', count: events.filter(e => e.category === 'sports').length },
    { id: 'cultural' as const, name: 'Культура', icon: '🎨', count: events.filter(e => e.category === 'cultural').length },
    { id: 'workshop' as const, name: 'Мастер-классы', icon: '🛠️', count: events.filter(e => e.category === 'workshop').length },
    { id: 'competition' as const, name: 'Соревнования', icon: '🏆', count: events.filter(e => e.category === 'competition').length },
    { id: 'special' as const, name: 'Особые', icon: '⭐', count: events.filter(e => e.category === 'special').length }
  ]

  const filteredEvents = useMemo(() => {
    let filtered = events

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(e => e.category === selectedCategory)
    }

    // Filter by status/type
    switch (filter) {
      case 'upcoming':
        filtered = filtered.filter(e => e.status === 'upcoming')
        break
      case 'ongoing':
        filtered = filtered.filter(e => e.status === 'ongoing')
        break
      case 'my_events':
        filtered = filtered.filter(e => ['registered', 'attending', 'completed'].includes(e.participationStatus))
        break
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Sort by date (upcoming first, then by start date)
    filtered.sort((a, b) => {
      if (a.status === 'ongoing' && b.status !== 'ongoing') return -1
      if (b.status === 'ongoing' && a.status !== 'ongoing') return 1
      if (a.featured && !b.featured) return -1
      if (b.featured && !a.featured) return 1
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    })

    return filtered
  }, [events, selectedCategory, filter, searchQuery])

  const handleRegister = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            participationStatus: 'registered' as ParticipationStatus,
            currentParticipants: event.currentParticipants + 1
          }
        : event
    ))
    showToast('Вы успешно записались на событие!', 'success')
  }

  const stats = useMemo(() => {
    const upcoming = events.filter(e => e.status === 'upcoming').length
    const ongoing = events.filter(e => e.status === 'ongoing').length
    const myEvents = events.filter(e => ['registered', 'attending', 'completed'].includes(e.participationStatus)).length
    
    return { upcoming, ongoing, myEvents, total: events.length }
  }, [events])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📅 События</h2>
        <p className="text-gray-600">Участвуйте в мероприятиях университета и получайте награды</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover={false} className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
            <div className="text-sm text-gray-600">Предстоящие</div>
          </CardContent>
        </Card>
        <Card hover={false} className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.ongoing}</div>
            <div className="text-sm text-gray-600">Идут сейчас</div>
          </CardContent>
        </Card>
        <Card hover={false} className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.myEvents}</div>
            <div className="text-sm text-gray-600">Мои события</div>
          </CardContent>
        </Card>
        <Card hover={false} className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Всего</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-start gap-6">
        {/* Sidebar with calendar and filters */}
        <aside className="hidden lg:block w-80 space-y-6">
          {/* Mini calendar */}
          <MiniCalendar 
            events={events}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />

          {/* Quick filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Фильтры</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { id: 'upcoming' as const, name: 'Предстоящие', count: stats.upcoming },
                  { id: 'ongoing' as const, name: 'Идут сейчас', count: stats.ongoing },
                  { id: 'my_events' as const, name: 'Мои события', count: stats.myEvents },
                  { id: 'all' as const, name: 'Все события', count: stats.total }
                ].map(filterOption => (
                  <button
                    key={filterOption.id}
                    onClick={() => setFilter(filterOption.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      filter === filterOption.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{filterOption.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      filter === filterOption.id ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {filterOption.count}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* Search and view controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск событий..."
                    className="w-full h-11 px-4 pl-11 pr-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* View selector */}
                <div className="flex gap-2">
                  {[
                    { id: 'grid' as const, icon: '⊞', name: 'Сетка' },
                    { id: 'list' as const, icon: '☰', name: 'Список' },
                    { id: 'calendar' as const, icon: '📅', name: 'Календарь' }
                  ].map(viewOption => (
                    <button
                      key={viewOption.id}
                      onClick={() => setView(viewOption.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        view === viewOption.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={viewOption.name}
                    >
                      {viewOption.icon}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{typeof category.icon === 'string' ? category.icon : '📅'}</span>
                    {category.name}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      selectedCategory === category.id ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Events display */}
          {view === 'grid' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRegister={handleRegister}
                  onViewDetails={setSelectedEvent}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {filteredEvents.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Нет событий</h3>
                <p className="text-gray-500">Измените фильтры или попробуйте другой поисковый запрос</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Event details modal */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={handleRegister}
      />

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white font-semibold min-w-[350px] transform transition-all duration-300 ${
          toast.type === 'error' 
            ? 'bg-gradient-to-r from-red-500 to-pink-600' 
            : 'bg-gradient-to-r from-green-500 to-emerald-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20">
              <span className="text-xl">{toast.type === 'error' ? '⚠️' : '🎉'}</span>
            </div>
            <div className="flex-1">
              <span>{toast.message}</span>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
