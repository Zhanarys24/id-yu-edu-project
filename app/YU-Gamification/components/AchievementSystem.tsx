'use client'

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Trophy, Star, Award, Crown, Medal, Zap, Target, Calendar, Users, Book, Coffee, Heart, Shield, Flame, Sparkles, Lock, CheckCircle, Clock, TrendingUp, Gift, Gamepad2 } from "lucide-react"

// Types for achievements
export type AchievementCategory = 'academic' | 'social' | 'attendance' | 'activity' | 'special' | 'seasonal'
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type AchievementType = 'progress' | 'milestone' | 'streak' | 'hidden' | 'timed'

export interface Achievement {
  id: string
  title: string
  description: string
  category: AchievementCategory
  rarity: AchievementRarity
  type: AchievementType
  icon: string
  requirements: {
    type: 'count' | 'streak' | 'score' | 'time' | 'special'
    target: number
    current?: number
    timeLimit?: number // in days
  }
  rewards: {
    coins: number
    xp: number
    badge?: string
    title?: string
    items?: string[]
  }
  unlocked: boolean
  completed: boolean
  completedAt?: string
  hidden?: boolean
  prerequisite?: string[] // IDs of required achievements
  seasonal?: {
    startDate: string
    endDate: string
  }
}

// Card components
const Card = ({ children, className = "", hover = true, ...rest }: any) => (
  <div {...rest} className={`rounded-2xl border border-gray-100 bg-white shadow-sm ${hover ? 'hover:shadow-xl hover:scale-[1.02]' : ''} transition-all duration-300 ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children, className = "" }: any) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
)

const CardTitle = ({ children, className = "" }: any) => (
  <h3 className={`text-xl font-bold text-gray-800 ${className}`}>
    {children}
  </h3>
)

const CardContent = ({ children, className = "" }: any) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
)

const Progress = ({ value = 0, className = "" }: { value?: number; className?: string }) => (
  <div className={`w-full bg-gray-100 rounded-full h-3 ${className} overflow-hidden`}>
    <div 
      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
    </div>
  </div>
)

// Badge component for achievement rarity
const RarityBadge = ({ rarity }: { rarity: AchievementRarity }) => {
  const rarityConfig = {
    common: { color: 'from-gray-400 to-gray-600', text: 'Обычное', icon: '⚪' },
    uncommon: { color: 'from-green-400 to-green-600', text: 'Необычное', icon: '🟢' },
    rare: { color: 'from-blue-400 to-blue-600', text: 'Редкое', icon: '🔵' },
    epic: { color: 'from-purple-400 to-purple-600', text: 'Эпическое', icon: '🟣' },
    legendary: { color: 'from-amber-400 to-orange-600', text: 'Легендарное', icon: '🟡' }
  }
  
  const config = rarityConfig[rarity]
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </span>
  )
}

// Achievement card component
const AchievementCard = ({ 
  achievement, 
  onClick 
}: { 
  achievement: Achievement
  onClick?: () => void 
}) => {
  const progressPercent = achievement.requirements.current 
    ? (achievement.requirements.current / achievement.requirements.target) * 100 
    : 0

  const categoryIcons = {
    academic: Book,
    social: Users,
    attendance: Calendar,
    activity: Zap,
    special: Crown,
    seasonal: Gift
  }

  const CategoryIcon = categoryIcons[achievement.category]

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 ${
        achievement.completed 
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
          : achievement.unlocked 
            ? 'hover:shadow-lg' 
            : 'opacity-60 bg-gray-50'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`relative flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${
            achievement.completed 
              ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white' 
              : achievement.unlocked 
                ? 'bg-gradient-to-br from-blue-400 to-purple-500 text-white'
                : 'bg-gray-200 text-gray-400'
          }`}>
            {achievement.completed && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
            {!achievement.unlocked && (
              <Lock className="w-6 h-6" />
            )}
            {achievement.unlocked && !achievement.completed && (
              <span>{achievement.icon}</span>
            )}
            {achievement.completed && (
              <span>{achievement.icon}</span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className={`font-bold text-lg truncate ${
                  achievement.completed ? 'text-green-700' : 'text-gray-800'
                }`}>
                  {achievement.title}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {achievement.description}
                </p>
              </div>
              <div className="ml-2 flex-shrink-0">
                <CategoryIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Rarity and rewards */}
            <div className="flex items-center gap-2 mb-3">
              <RarityBadge rarity={achievement.rarity} />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Image src="/YU-coin.png" alt="YU coin" width={16} height={16} className="w-4 h-4" />
                  <span className="font-semibold text-amber-600">{achievement.rewards.coins}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-blue-500" />
                  <span>{achievement.rewards.xp} XP</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            {achievement.unlocked && !achievement.completed && achievement.requirements.type === 'count' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Прогресс</span>
                  <span className="font-semibold">
                    {achievement.requirements.current || 0} / {achievement.requirements.target}
                  </span>
                </div>
                <Progress value={progressPercent} />
              </div>
            )}

            {/* Time limit warning */}
            {achievement.seasonal && (
              <div className="mt-2 flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                <Clock className="w-3 h-3" />
                <span>Ограничено по времени</span>
              </div>
            )}

            {/* Completion date */}
            {achievement.completed && achievement.completedAt && (
              <div className="mt-2 text-xs text-green-600">
                Получено: {new Date(achievement.completedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Achievement details modal
const AchievementModal = ({ 
  achievement, 
  onClose 
}: { 
  achievement: Achievement | null
  onClose: () => void 
}) => {
  if (!achievement) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-bold text-gray-800">Детали достижения</h3>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              ×
            </button>
          </div>

          <div className="text-center mb-6">
            <div className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-4xl mb-4 ${
              achievement.completed 
                ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white' 
                : achievement.unlocked 
                  ? 'bg-gradient-to-br from-blue-400 to-purple-500 text-white'
                  : 'bg-gray-200 text-gray-400'
            }`}>
              {achievement.unlocked ? achievement.icon : <Lock className="w-8 h-8" />}
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">{achievement.title}</h4>
            <RarityBadge rarity={achievement.rarity} />
          </div>

          <div className="space-y-4">
            <div>
              <h5 className="font-semibold text-gray-700 mb-2">Описание</h5>
              <p className="text-gray-600">{achievement.description}</p>
            </div>

            {achievement.unlocked && (
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">Требования</h5>
                <div className="bg-gray-50 rounded-lg p-3">
                  {achievement.requirements.type === 'count' && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Прогресс</span>
                        <span className="font-semibold">
                          {achievement.requirements.current || 0} / {achievement.requirements.target}
                        </span>
                      </div>
                      <Progress value={(achievement.requirements.current || 0) / achievement.requirements.target * 100} />
                    </div>
                  )}
                  {achievement.requirements.type === 'streak' && (
                    <p className="text-sm text-gray-600">
                      Поддерживайте серию {achievement.requirements.target} дней подряд
                    </p>
                  )}
                </div>
              </div>
            )}

            <div>
              <h5 className="font-semibold text-gray-700 mb-2">Награды</h5>
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-3 border border-amber-200">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Image src="/YU-coin.png" alt="YU coin" width={20} height={20} className="w-5 h-5" />
                    <span className="font-semibold text-amber-600">{achievement.rewards.coins} YU-coins</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-blue-500" />
                    <span>{achievement.rewards.xp} XP</span>
                  </div>
                </div>
                {achievement.rewards.title && (
                  <div className="mt-2 text-sm">
                    <span className="text-purple-600 font-semibold">Титул: </span>
                    <span className="text-gray-700">{achievement.rewards.title}</span>
                  </div>
                )}
                {achievement.rewards.items && achievement.rewards.items.length > 0 && (
                  <div className="mt-2 text-sm">
                    <span className="text-purple-600 font-semibold">Предметы: </span>
                    <span className="text-gray-700">{achievement.rewards.items.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {achievement.seasonal && (
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">Ограничение по времени</h5>
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <div className="flex items-center gap-2 text-sm text-orange-700">
                    <Clock className="w-4 h-4" />
                    <span>
                      Доступно до {new Date(achievement.seasonal.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Main achievements component
export default function AchievementSystem({ userStats }: { userStats: any }) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all')
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'completed' | 'locked'>('all')

  // Mock achievements data - в реальном приложении это будет из API/локального хранилища
  const achievements: Achievement[] = [
    {
      id: 'first_quest',
      title: 'Первые шаги',
      description: 'Выполните свой первый квест в системе геймификации',
      category: 'activity',
      rarity: 'common',
      type: 'milestone',
      icon: '🎯',
      requirements: { type: 'count', target: 1, current: userStats?.questsCompleted || 0 },
      rewards: { coins: 100, xp: 50 },
      unlocked: true,
      completed: (userStats?.questsCompleted || 0) >= 1
    },
    {
      id: 'quest_master',
      title: 'Мастер квестов',
      description: 'Выполните 50 квестов',
      category: 'activity',
      rarity: 'rare',
      type: 'progress',
      icon: '🏆',
      requirements: { type: 'count', target: 50, current: userStats?.questsCompleted || 0 },
      rewards: { coins: 2500, xp: 1000, title: 'Мастер квестов' },
      unlocked: true,
      completed: (userStats?.questsCompleted || 0) >= 50
    },
    {
      id: 'perfect_attendance',
      title: 'Идеальная посещаемость',
      description: 'Посещайте все лекции в течение месяца',
      category: 'attendance',
      rarity: 'epic',
      type: 'streak',
      icon: '📚',
      requirements: { type: 'streak', target: 30, current: userStats?.attendanceStreak || 0 },
      rewards: { coins: 5000, xp: 2000, title: 'Образцовый студент' },
      unlocked: true,
      completed: false
    },
    {
      id: 'social_butterfly',
      title: 'Душа компании',
      description: 'Добавьте 20 друзей в систему',
      category: 'social',
      rarity: 'uncommon',
      type: 'progress',
      icon: '👥',
      requirements: { type: 'count', target: 20, current: userStats?.friendsCount || 0 },
      rewards: { coins: 800, xp: 400 },
      unlocked: true,
      completed: false
    },
    {
      id: 'coin_collector',
      title: 'Коллекционер монет',
      description: 'Накопите 100,000 YU-coins',
      category: 'activity',
      rarity: 'epic',
      type: 'milestone',
      icon: '💰',
      requirements: { type: 'count', target: 100000, current: userStats?.totalCoinsEarned || 0 },
      rewards: { coins: 10000, xp: 5000, items: ['Золотой значок коллекционера'] },
      unlocked: true,
      completed: false
    },
    {
      id: 'early_bird',
      title: 'Ранняя пташка',
      description: 'Заходите в приложение до 8:00 утра 10 дней подряд',
      category: 'activity',
      rarity: 'rare',
      type: 'streak',
      icon: '🌅',
      requirements: { type: 'streak', target: 10, current: 0 },
      rewards: { coins: 1500, xp: 750, title: 'Ранняя пташка' },
      unlocked: true,
      completed: false
    },
    {
      id: 'halloween_special',
      title: 'Хэллоуин 2024',
      description: 'Участвуйте в специальных хэллоуинских квестах',
      category: 'seasonal',
      rarity: 'legendary',
      type: 'timed',
      icon: '🎃',
      requirements: { type: 'special', target: 1 },
      rewards: { coins: 10000, xp: 5000, items: ['Тыквенная маска', 'Хэллоуинский значок'] },
      unlocked: true,
      completed: false,
      seasonal: {
        startDate: '2024-10-25',
        endDate: '2024-11-05'
      }
    },
    {
      id: 'hidden_treasure',
      title: '???',
      description: 'Найдите скрытое сокровище в университете',
      category: 'special',
      rarity: 'legendary',
      type: 'hidden',
      icon: '💎',
      requirements: { type: 'special', target: 1 },
      rewards: { coins: 15000, xp: 7500, title: 'Искатель сокровищ' },
      unlocked: false,
      completed: false,
      hidden: true
    }
  ]

  const categories = [
    { id: 'all' as const, name: 'Все', icon: Trophy, count: achievements.length },
    { id: 'academic' as const, name: 'Учеба', icon: Book, count: achievements.filter(a => a.category === 'academic').length },
    { id: 'social' as const, name: 'Социальное', icon: Users, count: achievements.filter(a => a.category === 'social').length },
    { id: 'attendance' as const, name: 'Посещаемость', icon: Calendar, count: achievements.filter(a => a.category === 'attendance').length },
    { id: 'activity' as const, name: 'Активность', icon: Zap, count: achievements.filter(a => a.category === 'activity').length },
    { id: 'special' as const, name: 'Особые', icon: Crown, count: achievements.filter(a => a.category === 'special').length },
    { id: 'seasonal' as const, name: 'Сезонные', icon: Gift, count: achievements.filter(a => a.category === 'seasonal').length }
  ]

  const filteredAchievements = useMemo(() => {
    let filtered = achievements
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory)
    }
    
    // Filter by status
    switch (filter) {
      case 'unlocked':
        filtered = filtered.filter(a => a.unlocked && !a.completed)
        break
      case 'completed':
        filtered = filtered.filter(a => a.completed)
        break
      case 'locked':
        filtered = filtered.filter(a => !a.unlocked)
        break
    }
    
    return filtered
  }, [selectedCategory, filter])

  const stats = useMemo(() => {
    const total = achievements.length
    const completed = achievements.filter(a => a.completed).length
    const unlocked = achievements.filter(a => a.unlocked && !a.completed).length
    const locked = achievements.filter(a => !a.unlocked).length
    
    return { total, completed, unlocked, locked }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🏆 Достижения</h2>
        <p className="text-gray-600">Открывайте достижения и получайте награды за свою активность</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover={false} className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Получено</div>
          </CardContent>
        </Card>
        <Card hover={false} className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.unlocked}</div>
            <div className="text-sm text-gray-600">В прогрессе</div>
          </CardContent>
        </Card>
        <Card hover={false} className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.locked}</div>
            <div className="text-sm text-gray-600">Заблокировано</div>
          </CardContent>
        </Card>
        <Card hover={false} className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{Math.round((stats.completed / stats.total) * 100)}%</div>
            <div className="text-sm text-gray-600">Завершено</div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    selectedCategory === category.id ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {category.count}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { id: 'all' as const, name: 'Все', count: filteredAchievements.length },
          { id: 'completed' as const, name: 'Полученные', count: stats.completed },
          { id: 'unlocked' as const, name: 'В прогрессе', count: stats.unlocked },
          { id: 'locked' as const, name: 'Заблокированные', count: stats.locked }
        ].map(filterOption => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              filter === filterOption.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filterOption.name} ({filterOption.count})
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAchievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            onClick={() => setSelectedAchievement(achievement)}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredAchievements.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Нет достижений</h3>
            <p className="text-gray-500">Измените фильтры или категорию для просмотра других достижений</p>
          </CardContent>
        </Card>
      )}

      {/* Achievement details modal */}
      <AchievementModal
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  )
}
