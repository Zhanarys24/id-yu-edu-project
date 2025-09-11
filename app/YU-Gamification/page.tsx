'use client'

import { useState, useEffect, useMemo, cloneElement } from "react"
import Image from "next/image"
import type { ReactNode, ReactElement } from "react"
import { Trophy, Coins, Star, Award, ArrowRight, Zap, Target, Monitor, Newspaper, Calendar, Users, Gift, Crown, Medal, Flame, ShoppingBag, Home, ChevronRight, Sparkles, TrendingUp, Clock, BookOpen, Gamepad2 } from "lucide-react"
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import { useAvatar } from '@/context/AvatarContext'
import { useAuth } from '@/context/AuthContext'
import AchievementSystem from './components/AchievementSystem'
import EventSystem from './components/EventSystem'

// Disable prerendering/SSG to avoid server evaluation of browser APIs
export const dynamic = 'force-dynamic'
// export const revalidate = false

// ClientOnly component to prevent hydration mismatch
const ClientOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false)
  
  useEffect(() => {
    setHasMounted(true)
  }, [])
  
  if (!hasMounted) {
    return fallback || null
  }
  
  return <>{children}</>
}

// Enhanced Card components with better styling
const Card = ({ children, className = "", hover = true, ...rest }: { children: ReactNode; className?: string; hover?: boolean } & React.HTMLAttributes<HTMLDivElement>) => (
  <div {...rest} className={`rounded-2xl border border-gray-100 bg-white shadow-sm ${hover ? 'hover:shadow-lg hover:scale-[1.02]' : ''} transition-all duration-300 ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
)

const CardTitle = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <h3 className={`text-xl font-bold text-gray-800 ${className}`}>
    {children}
  </h3>
)

const CardContent = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
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

// Quest types (declare before QuestCardProps)
type QuestCategory = 'academic' | 'social' | 'achievement' | 'daily' | 'event'
type QuestType = 'normal' | 'daily' | 'weekly' | 'urgent' | 'chain'
type RewardType = {
  coins: number;
  xp?: number;
  items?: string[];
  badges?: string[];
}

// Enhanced Quest Card with better visual hierarchy
type QuestCardProps = {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: QuestCategory;
  type: QuestType;
  progress: number;
  current: number;
  total: number;
  rewards: RewardType;
  icon: ReactNode;
  onAction?: () => void;
  disabled?: boolean;
  completed?: boolean;
  unlocked?: boolean;
  deadline?: string;
  chainStep?: number;
  requiredLevel?: number;
  userLevel?: number;
}

function QuestCard(props: QuestCardProps) {
  const { 
    title, 
    description, 
    difficulty, 
    category, 
    type, 
    progress, 
    current, 
    total, 
    rewards, 
    icon, 
    onAction, 
    disabled, 
    completed, 
    unlocked = true, 
    deadline, 
    chainStep, 
    requiredLevel, 
    userLevel = 1 
  } = props
  
  const categoryConfig = {
    academic: { icon: '📚', color: 'text-blue-600', bg: 'bg-blue-50' },
    social: { icon: '🤝', color: 'text-green-600', bg: 'bg-green-50' },
    achievement: { icon: '🏆', color: 'text-purple-600', bg: 'bg-purple-50' },
    daily: { icon: '⏰', color: 'text-orange-600', bg: 'bg-orange-50' },
    event: { icon: '🎉', color: 'text-pink-600', bg: 'bg-pink-50' },
  }
  
  const typeConfig = {
    normal: { prefix: '', bg: '' },
    daily: { prefix: '📅', bg: 'bg-orange-100' },
    weekly: { prefix: '📆', bg: 'bg-blue-100' },
    urgent: { prefix: '⚡', bg: 'bg-red-100' },
    chain: { prefix: '🔗', bg: 'bg-purple-100' },
  }
  
  const isTimeLeft = deadline && new Date(deadline) > new Date()
  const timeLeft = deadline ? Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60))) : 0
  const isLocked = !unlocked || Boolean(requiredLevel && userLevel < requiredLevel)
  
  const difficultyConfig = {
    easy: { 
      gradient: "from-emerald-400 to-green-500", 
      text: "Легкий", 
      bg: "bg-emerald-50", 
      textColor: "text-emerald-700",
      border: "border-emerald-200"
    },
    medium: { 
      gradient: "from-amber-400 to-orange-500", 
      text: "Средний", 
      bg: "bg-amber-50", 
      textColor: "text-amber-700",
      border: "border-amber-200"
    },
    hard: { 
      gradient: "from-rose-400 to-pink-500", 
      text: "Сложный", 
      bg: "bg-rose-50", 
      textColor: "text-rose-700",
      border: "border-rose-200"
    }
  }
  
  const config = difficultyConfig[difficulty]
  
  return (
    <Card className="group relative overflow-hidden">
      {completed && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Star className="w-3 h-3" />
            Завершено
          </div>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {cloneElement(icon as ReactElement<{ className?: string }>, { className: 'w-6 h-6' })}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors">
              {title}
            </CardTitle>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.textColor} ${config.border} border`}>
              {config.text}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 font-medium">Прогресс</span>
            <span className="text-gray-800 font-bold">{current}/{total}</span>
          </div>
          <Progress value={progress} />
          <div className="text-xs text-gray-500 text-right">{progress}% завершено</div>
        </div>
        
        <div className="space-y-3 pt-2 border-t border-gray-50">
          {/* Награды */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Награды:</p>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg text-xs">
                <Image src="/YU-coin.png" alt="YU coin" width={16} height={16} className="w-4 h-4" />
                <span className="font-bold text-amber-600">+{rewards.coins}</span>
              </div>
              {rewards.xp && (
                <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg text-xs">
                  <Star className="w-3 h-3 text-blue-600" />
                  <span className="font-bold text-blue-600">+{rewards.xp} XP</span>
                </div>
              )}
              {rewards.items && rewards.items.map((item: string, idx: number) => (
                <div key={idx} className="bg-purple-50 px-2 py-1 rounded-lg text-xs text-purple-700 font-medium">
                  {item}
                </div>
              ))}
              {rewards.badges && rewards.badges.map((badge: string, idx: number) => (
                <div key={idx} className="bg-green-50 px-2 py-1 rounded-lg text-xs text-green-700 font-medium">
                  {badge}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
          
          <button
            onClick={onAction || (() => {})}
              disabled={disabled || !onAction || isLocked}
            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
              completed 
                ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                  : isLocked
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : disabled || !onAction
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : `bg-gradient-to-r ${config.gradient} text-white hover:shadow-lg hover:scale-105 active:scale-95`
            }`}
          >
              {completed ? '✅ Готово' : 
               isLocked ? '🔒 Заблокировано' :
               !onAction ? '👁️ Просмотр' : 
               '🚀 Выполнить'}
          </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced Stat Card with animations
type StatCardProps = { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: ReactElement; 
  gradient: string;
  trend?: 'up' | 'down' | 'neutral';
}

function StatCard({ title, value, subtitle, icon, gradient, trend = 'neutral' }: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <Card 
      className="relative overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
            <div className="flex items-baseline gap-2 mb-1">
              <p className="text-3xl font-bold text-gray-800">{value}</p>
              {trend !== 'neutral' && (
                <div className={`flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                  <TrendingUp className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
                </div>
              )}
            </div>
            <p className="text-gray-500 text-xs">{subtitle}</p>
          </div>
          <div className={`w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg transform transition-transform duration-300 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
            {cloneElement(icon as ReactElement<{ className?: string }>, { className: 'w-7 h-7 text-white' })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced Leader Item with better styling
type LeaderItemProps = { rank: number; name: string; coins: number; isTop?: boolean; isUser?: boolean }

function LeaderItem({ rank, name, coins, isTop = false, isUser = false }: LeaderItemProps) {
  const getRankIcon = () => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Award className="w-5 h-5 text-orange-500" />
    return null
  }
  
  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-200 border ${
      isUser 
        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-md' 
        : isTop 
        ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-sm' 
        : 'bg-white border-gray-100 hover:bg-gray-50 hover:shadow-sm'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`relative w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg ${
          rank === 1 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg' :
          rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-lg' :
          rank === 3 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg' : 
          'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'
        }`}>
          {rank}
          {getRankIcon() && (
            <div className="absolute -top-1 -right-1">
              {getRankIcon()}
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${isUser ? 'text-blue-700' : 'text-gray-800'}`}>
              {name}
            </span>
            {isUser && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Вы</span>}
          </div>
          {rank <= 3 && (
            <div className="text-xs text-gray-500 mt-0.5">
              {rank === 1 ? '🏆 Лидер' : rank === 2 ? '🥈 Второе место' : '🥉 Третье место'}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 font-bold text-amber-600">
        <span className="text-lg">{coins}</span>
        <Image src="/YU-coin.png" alt="YU coin" width={28} height={28} className="w-12 h-12" />
      </div>
    </div>
  )
}

// Enhanced Achievement component
type AchievementProps = { icon: ReactElement; title: string; description: string; earned: boolean; rarity?: 'common' | 'rare' | 'epic' | 'legendary' }

function Achievement({ icon, title, description, earned, rarity = 'common' }: AchievementProps) {
  const rarityConfig = {
    common: { border: 'border-gray-200', bg: 'bg-gray-50', glow: '' },
    rare: { border: 'border-blue-200', bg: 'bg-blue-50', glow: 'shadow-blue-100' },
    epic: { border: 'border-purple-200', bg: 'bg-purple-50', glow: 'shadow-purple-100' },
    legendary: { border: 'border-amber-200', bg: 'bg-gradient-to-br from-amber-50 to-yellow-50', glow: 'shadow-amber-100' }
  }
  
  const config = rarityConfig[rarity]
  
  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 ${
      earned 
        ? `${config.bg} ${config.border} ${config.glow} hover:scale-105 shadow-lg` 
        : 'bg-gray-50 border-gray-200 opacity-60'
    }`}>
      <div className="flex flex-col items-center text-center space-y-3">
        <div className={`p-2 rounded-xl ${earned ? '' : 'grayscale'} transition-all duration-300`}>
          {cloneElement(icon as ReactElement<{ className?: string }>, { className: 'w-8 h-8' })}
        </div>
        <div>
          <p className={`font-semibold text-sm mb-1 ${earned ? 'text-gray-800' : 'text-gray-500'}`}>
            {title}
          </p>
          <p className="text-gray-500 text-xs leading-relaxed">{description}</p>
          {earned && rarity !== 'common' && (
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {rarity === 'rare' ? 'Редкое' : rarity === 'epic' ? 'Эпическое' : 'Легендарное'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Enhanced Action Button
type ActionButtonProps = { 
  icon: ReactElement; 
  label: string; 
  subtitle?: string; 
  color: string; 
  onClick: () => void; 
  badge?: string | number;
  disabled?: boolean;
}

function ActionButton({ icon, label, subtitle, color, onClick, badge, disabled = false }: ActionButtonProps) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`group relative p-5 rounded-2xl bg-white border border-gray-100 text-left transition-all duration-300 ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:shadow-xl hover:scale-[1.02] hover:border-gray-200 active:scale-[0.98]'
      }`}
    >
      {badge !== undefined && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold shadow-lg">
            {String(badge)}
          </span>
        </div>
      )}
      
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}> 
          {cloneElement(icon as ReactElement<{ className?: string }>, { className: 'w-6 h-6' })}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-800 text-lg mb-1">{label}</div>
          {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 group-hover:text-gray-600 transition-all duration-200" />
      </div>
    </button>
  )
}

export default function DashboardPage() {
  const { userName, avatar } = useAvatar()
  const { user } = useAuth()
  const router = useRouter()
  
  // Toast system
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null)
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Game state with localStorage sync
  type GameState = { 
    coins: number; 
    earnedCoins: number; // Total earned coins for leaderboard (only increases)
    level: number; 
    xp: number; 
    xpNeeded: number; 
    streak: number; 
    lastActive: string 
  }
  
  const initialGameState: GameState = { 
    coins: 50000, // Current spendable coins
    earnedCoins: 50000, // Total earned coins for leaderboard
    level: 8, 
    xp: 175, 
    xpNeeded: 200, 
    streak: 12, 
    lastActive: new Date().toISOString().slice(0,10) 
  }
  
  const [state, setState] = useState<GameState>(initialGameState)

  const [isClient, setIsClient] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
    
    if (typeof window !== 'undefined') {
      // Load game state from localStorage
      const saved = localStorage.getItem('yuGamificationState')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // Merge with defaults to ensure all properties exist
          setState({ ...initialGameState, ...parsed })
        } catch (e) {
          console.error('Failed to parse saved game state:', e)
        }
      }

      // Check daily claim status
      const today = new Date().toISOString().slice(0, 10)
      const lastClaim = localStorage.getItem('lastDailyClaim')
      setClaimedToday(lastClaim === today)
      
      // Mark as hydrated after everything is loaded
      setTimeout(() => setIsHydrated(true), 0)
    }
  }, [])

  // Расширенные типы для квестов (moved to top)

  type Quest = { 
    id: number; 
    title: string; 
    description: string;
    difficulty: 'easy'|'medium'|'hard'; 
    category: QuestCategory;
    type: QuestType;
    current: number; 
    total: number; 
    rewards: RewardType; 
    icon: ReactElement; 
    completed: boolean;
    unlocked: boolean;
    chainId?: string;
    chainStep?: number;
    deadline?: string;
    cooldownUntil?: string;
    requiredLevel?: number;
  }
  
  // Генерация ежедневных квестов
  const generateDailyQuests = (): Quest[] => {
    if (typeof window === 'undefined') {
      return []
    }

    const today = new Date().toDateString()
    const savedDaily = typeof localStorage !== 'undefined' ? localStorage.getItem(`dailyQuests_${today}`) : null
    
  if (savedDaily) {
    return JSON.parse(savedDaily).map((q: unknown) => 
      Object.assign({}, q, { icon: <Target className="w-6 h-6" /> })
    )
  }

    const dailyTemplates = [
      { title: 'Ежедневный вход', description: 'Войдите в систему', total: 1, rewards: { coins: 50, xp: 25 } },
      { title: 'Активность', description: 'Выполните любое действие в системе', total: 3, rewards: { coins: 75, xp: 30 } },
      { title: 'Обучение', description: 'Откройте учебные материалы', total: 2, rewards: { coins: 100, xp: 40 } },
    ]

    const dailyQuests = dailyTemplates.map((template, index) => ({
      id: 1000 + index,
      title: template.title,
      description: template.description,
      difficulty: 'easy' as const,
      category: 'daily' as const,
      type: 'daily' as const,
      current: 0,
      total: template.total,
      rewards: template.rewards,
      icon: <Target className="w-6 h-6" />,
      completed: false,
      unlocked: true,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }))

    // Сохраняем без иконки, чтобы избежать circular reference
    const questsToSave = dailyQuests.map(q => {
      const { icon, ...questWithoutIcon } = q
      return questWithoutIcon
    })
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`dailyQuests_${today}`, JSON.stringify(questsToSave))
    }
    return dailyQuests
  }
  
  const [quests, setQuests] = useState<Quest[]>([
    // Учебные квесты
    { 
      id: 1, 
      title: 'Посещение лекций', 
      description: 'Регулярно посещайте лекции для получения знаний',
      difficulty: 'easy', 
      category: 'academic',
      type: 'normal',
      current: 4, 
      total: 5, 
      rewards: { coins: 150, xp: 75, badges: ['📚 Прилежный студент'] }, 
      icon: <Calendar className="w-6 h-6" />, 
      completed: false,
      unlocked: true,
    },
    { 
      id: 2, 
      title: 'Своевременная сдача работ', 
      description: 'Сдавайте все задания в срок',
      difficulty: 'medium', 
      category: 'academic',
      type: 'normal',
      current: 8, 
      total: 10, 
      rewards: { coins: 300, xp: 120, items: ['⚡ Пунктуальность'] }, 
      icon: <Medal className="w-6 h-6" />, 
      completed: false,
      unlocked: true,
    },
    { 
      id: 3, 
      title: 'Активное участие в дискуссиях', 
      description: 'Принимайте активное участие в учебных дискуссиях',
      difficulty: 'hard', 
      category: 'social',
      type: 'normal',
      current: 5, 
      total: 10, 
      rewards: { coins: 500, xp: 200, badges: ['🗣️ Оратор'] }, 
      icon: <Users className="w-6 h-6" />, 
      completed: false,
      unlocked: true,
    },
    { 
      id: 4, 
      title: 'Помощь однокурсникам', 
      description: 'Помогайте своим однокурсникам в учёбе',
      difficulty: 'medium', 
      category: 'social',
      type: 'normal',
      current: 3, 
      total: 7, 
      rewards: { coins: 250, xp: 100, badges: ['🤝 Помощник'] }, 
      icon: <Gift className="w-6 h-6" />, 
      completed: false,
      unlocked: true,
    },

    // Достижения
    { 
      id: 5, 
      title: 'Попасть в топ-10', 
      description: 'Войдите в десятку лучших студентов',
      difficulty: 'hard', 
      category: 'achievement',
      type: 'normal',
      current: 0, 
      total: 1, 
      rewards: { coins: 1000, xp: 500, items: ['🏆 Трофей топ-10'], badges: ['⭐ Звезда'] }, 
      icon: <Trophy className="w-6 h-6" />, 
      completed: false,
      unlocked: true,
    },
    { 
      id: 6, 
      title: 'Заработать 10000 монет', 
      description: 'Накопите 10000 YU-coins',
      difficulty: 'medium', 
      category: 'achievement',
      type: 'normal',
      current: 0, 
      total: 10000, 
      rewards: { coins: 2000, xp: 300, items: ['💰 Золотой кошелек'] }, 
      icon: <Coins className="w-6 h-6" />, 
      completed: false,
      unlocked: true,
    },

    // Квест-цепочка "Путь новичка"
    { 
      id: 10, 
      title: 'Знакомство с системой', 
      description: 'Первый шаг в мире геймификации',
      difficulty: 'easy', 
      category: 'academic',
      type: 'chain',
      current: 0, 
      total: 1, 
      rewards: { coins: 100, xp: 50 }, 
      icon: <Star className="w-6 h-6" />, 
      completed: false,
      unlocked: true,
      chainId: 'newcomer',
      chainStep: 1,
    },
    { 
      id: 11, 
      title: 'Первые достижения', 
      description: 'Выполните свои первые задания',
      difficulty: 'easy', 
      category: 'academic',
      type: 'chain',
      current: 0, 
      total: 3, 
      rewards: { coins: 200, xp: 100, badges: ['🌟 Начинающий'] }, 
      icon: <Award className="w-6 h-6" />, 
      completed: false,
      unlocked: false,
      chainId: 'newcomer',
      chainStep: 2,
    },
    { 
      id: 12, 
      title: 'Становление мастера', 
      description: 'Достигните нового уровня мастерства',
      difficulty: 'medium', 
      category: 'achievement',
      type: 'chain',
      current: 0, 
      total: 1, 
      rewards: { coins: 500, xp: 250, items: ['🎓 Диплом мастера'], badges: ['🎯 Целеустремленный'] }, 
      icon: <Crown className="w-6 h-6" />, 
      completed: false,
      unlocked: false,
      chainId: 'newcomer',
      chainStep: 3,
      requiredLevel: 5,
    },

    // Срочные квесты
    { 
      id: 20, 
      title: '⚡ Экстренное задание', 
      description: 'Срочно! Помогите преподавателю с проектом',
      difficulty: 'medium', 
      category: 'event',
      type: 'urgent',
      current: 0, 
      total: 1, 
      rewards: { coins: 400, xp: 200, items: ['⚡ Молния скорости'] }, 
      icon: <Zap className="w-6 h-6" />, 
      completed: false,
      unlocked: true,
      deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 часов
    },

    // Еженедельные квесты
    { 
      id: 30, 
      title: 'Недельный марафон', 
      description: 'Выполните 15 заданий за неделю',
      difficulty: 'hard', 
      category: 'achievement',
      type: 'weekly',
      current: 0, 
      total: 15, 
      rewards: { coins: 800, xp: 400, badges: ['🏃 Марафонец'], items: ['🏅 Недельная медаль'] }, 
      icon: <Flame className="w-6 h-6" />, 
      completed: false,
      unlocked: true,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 дней
    },

    ...generateDailyQuests(),
  ])

  type Leader = { name: string; coins: number }
  const [leaderboard, setLeaderboard] = useState<Leader[]>([
    { name: user?.name || userName, coins: 50000 },
    { name: "Айжан Қайратқызы", coins: 18900 },
    { name: "Данияр Әлімжанов", coins: 16750 },
    { name: "Әсел Нұрғалиева", coins: 14300 },
    { name: "Ернар Мақсатұлы", coins: 13850 },
    { name: "Аружан Төлеген", coins: 12500 },
    { name: "Алмат Серік", coins: 11800 },
    { name: "Мадина Бекзат", coins: 10500 },
  ])

  // Update user's earned coins in leaderboard when earnedCoins changes
  useEffect(() => {
    if (!isHydrated) return
    const currentUserName = user?.name || userName
    setLeaderboard(prev => {
      const updated = prev.map(leader => 
        leader.name === currentUserName 
          ? { ...leader, coins: state.earnedCoins }
          : leader
      )
      // Sort by coins descending to maintain correct ranking
      return updated.sort((a, b) => b.coins - a.coins)
    })
  }, [state.earnedCoins, userName, user?.name, isHydrated])

  type Activity = { id: number; type: string; title: string; reward: number; timestamp: string }
  const [activity] = useState<Activity[]>([
    { id: 1, type: 'quest', title: 'Посещение лекций', reward: 75, timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, type: 'achievement', title: 'Примерный студент', reward: 100, timestamp: new Date(Date.now() - 7200000).toISOString() },
  ])

  // Navigation
  type Tab = 'dashboard' | 'quests' | 'shop' | 'leaders' | 'events' | 'profile' | 'achievements'
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  // Daily reward
  const [claimedToday, setClaimedToday] = useState<boolean>(false)
  const [claimInProgress, setClaimInProgress] = useState<boolean>(false)
  
  const claimDaily = () => {
    console.log('claimDaily called, claimedToday:', claimedToday, 'claimInProgress:', claimInProgress)
    if (claimedToday || claimInProgress) return
    
    setClaimInProgress(true)
    setClaimedToday(true)
    const today = new Date().toISOString().slice(0, 10)
    localStorage.setItem('lastDailyClaim', today)
    
    setState(s => {
      console.log('Daily reward - before:', s.coins, s.earnedCoins)
      const newState = { 
        ...s, 
        coins: s.coins + 50, 
        earnedCoins: s.earnedCoins + 50 
      }
      console.log('Daily reward - after:', newState.coins, newState.earnedCoins)
      return newState
    })
    
    showToast('Ежедневный подарок: +50 YU-coins! 🎉', 'success')
    
    // Reset claim in progress after a short delay
    setTimeout(() => setClaimInProgress(false), 1000)
  }

  // Quest filters
  type QuestFilter = 'all' | 'active' | 'completed'
  type CategoryFilter = 'all' | QuestCategory | QuestType
  const [filter, setFilter] = useState<QuestFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  
  const visibleQuests = useMemo(() => {
    let filtered = quests
    
    // Фильтр по статусу
    if (filter === 'active') filtered = filtered.filter(q => !q.completed && q.unlocked)
    if (filter === 'completed') filtered = filtered.filter(q => q.completed)
    
    // Фильтр по категории/типу
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(q => 
        q.category === categoryFilter || q.type === categoryFilter
      )
    }
    
    // Скрыть заблокированные квесты если нет соответствующего уровня
    filtered = filtered.filter(q => 
      q.unlocked && (!q.requiredLevel || state.level >= q.requiredLevel)
    )
    
    return filtered
  }, [quests, filter, categoryFilter, state.level])

  // Animated values
  // Sync state to localStorage whenever it changes (only after hydration)
  const [lastSavedState, setLastSavedState] = useState<string>('')
  
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      const currentStateString = JSON.stringify(state)
      if (currentStateString !== lastSavedState) {
        console.log('Saving state to localStorage:', state)
        localStorage.setItem('yuGamificationState', currentStateString)
        setLastSavedState(currentStateString)
      } else {
        console.log('State unchanged, skipping localStorage save')
      }
    }
  }, [state, isHydrated, lastSavedState])

  // Listen for localStorage changes from other pages/tabs
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'yuGamificationState' && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue)
          console.log('🔄 External storage change detected from another tab/page:', newState)
          setState(prevState => {
            const targetState = { ...initialGameState, ...newState }
            // Only update if the state actually changed
            if (JSON.stringify(prevState) !== JSON.stringify(targetState)) {
              console.log('📥 Updating state from external source:', prevState, '->', targetState)
              return targetState
            }
            console.log('📋 External storage state unchanged, ignoring')
            return prevState
          })
        } catch (error) {
          console.error('Failed to parse storage change:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const [animatedCoins, setAnimatedCoins] = useState(state.coins)
  const [animatedLevel, setAnimatedLevel] = useState(Math.round((state.xp / state.xpNeeded) * 100))

  // Update animated values when state changes
  useEffect(() => {
    setAnimatedCoins(state.coins)
  }, [state.coins])

  useEffect(() => {
    setAnimatedLevel(Math.round((state.xp / state.xpNeeded) * 100))
  }, [state.xp, state.xpNeeded])

  // Falling YU coin background
  const coins = useMemo(() => {
    const count = 18
    return Array.from({ length: count }).map((_, i) => {
      const size = 40 + (i % 5) * 8
      return {
        id: `coin-${i}`,
        left: `${(i * 100 / count + (i % 3) * 3) % 100}%`,
        delay: `${(i % 6) * 0.8}s`,
        duration: `${10 + (i % 7) * 1.5}s`,
        size
      }
    })
  }, [])


  // Quest actions
  const [questInProgress, setQuestInProgress] = useState<Set<number>>(new Set())
  
  const handleQuestAction = (id: number) => {
    console.log('handleQuestAction called with id:', id, 'inProgress:', questInProgress.has(id))
    
    if (questInProgress.has(id)) {
      console.log('Quest action already in progress for id:', id)
      return
    }
    
    setQuestInProgress(prev => new Set(prev).add(id))
    
    // Сначала находим квест и проверяем, можно ли его завершить
    const currentQuest = quests.find(q => q.id === id)
    if (!currentQuest || currentQuest.completed) {
      console.log('Quest not found or already completed:', id)
      setQuestInProgress(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
      return
    }
    
    const nextCurrent = Math.min(currentQuest.total, currentQuest.current + 1)
    const willBeCompleted = nextCurrent >= currentQuest.total && !currentQuest.completed
    
    // Если квест будет завершен, сразу начисляем награду
    if (willBeCompleted) {
      console.log('Quest will be completed, rewards:', currentQuest.rewards)
        setState(s => {
        console.log('Quest reward - before:', s.coins, s.earnedCoins, 'XP:', s.xp)
        
        // Обрабатываем XP и уровни
        const xpGain = (currentQuest.rewards.xp || 0) + currentQuest.rewards.coins // Монеты тоже дают XP
        let newXp = s.xp + xpGain
          let newLevel = s.level
          let xpNeeded = s.xpNeeded
          
          while (newXp >= xpNeeded) {
            newXp -= xpNeeded
            newLevel += 1
            xpNeeded = Math.round(xpNeeded * 1.2)
          }
          
          const newState = { 
            ...s, 
          coins: s.coins + currentQuest.rewards.coins, 
          earnedCoins: s.earnedCoins + currentQuest.rewards.coins, 
            xp: newXp, 
            level: newLevel, 
            xpNeeded 
          }
        console.log('Quest reward - after:', newState.coins, newState.earnedCoins, 'XP:', newState.xp, 'Level:', newState.level)
          return newState
        })
        
      // Более детальное уведомление о наградах
      const rewardText = [
        `+${currentQuest.rewards.coins} YU-coins`,
        currentQuest.rewards.xp ? `+${currentQuest.rewards.xp} XP` : null,
        currentQuest.rewards.badges ? currentQuest.rewards.badges.join(', ') : null,
        currentQuest.rewards.items ? currentQuest.rewards.items.join(', ') : null,
      ].filter(Boolean).join(' • ')
      
      showToast(`🎉 Квест завершен: ${rewardText}`, 'success')
      
      // Проверяем и разблокируем следующий квест в цепочке
      if (currentQuest.chainId && currentQuest.chainStep) {
        setQuests(prev => prev.map(q => 
          q.chainId === currentQuest.chainId && 
          q.chainStep === (currentQuest.chainStep! + 1) 
            ? { ...q, unlocked: true }
            : q
        ))
      }
    }
    
    // Затем обновляем квест без дополнительной логики начисления
    setQuests(prev => prev.map(q => {
      if (q.id !== id) return q
      
      const nextCurrent = Math.min(q.total, q.current + 1)
      const completed = nextCurrent >= q.total
      
      return { ...q, current: nextCurrent, completed }
    }))
      
      // Remove from in-progress set after completion
      setTimeout(() => {
        setQuestInProgress(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }, 1000)
  }

  // Shop items
  const shopItems = [
    { id: 1, name: 'Қосымша мүмкіндік', cost: 40000, desc: 'Қайта тапсыруға қосымша мүмкіндік', icon: '🎯' },
    { id: 2, name: 'Университет мерчі', cost: 5000, desc: 'Логотипі бар эксклюзивті мерч', icon: '👕' },
    { id: 3, name: 'Кофе', cost: 3000, desc: 'Жылы әрі дәмді кофе', icon: '☕' },
    { id: 4, name: 'Кезексіз қызмет', cost: 10000, desc: 'Оқытушыға кезексіз жазылу', icon: '⚡' },
  ]

  const purchase = (itemId: number) => {
    const item = shopItems.find(i => i.id === itemId)
    if (!item || state.coins < item.cost) {
      showToast('YU-coins жеткіліксіз! 💰', 'error')
      return
    }
    setState(s => ({ ...s, coins: s.coins - item.cost }))
    showToast(`Сатып алынды: ${item.name} (-${item.cost} YU-coins / -${item.cost} KZT)`, 'success')
  }

  const currentUserName = user?.name || userName
  const userRank = Math.max(1, leaderboard.findIndex(l => l.name === currentUserName) + 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Falling YU coins background */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        {coins.map(c => {
          const coinStyle: React.CSSProperties & { '--dur': string } = {
            left: c.left,
            width: `${c.size}px`,
            height: `${c.size}px`,
            animationDelay: c.delay,
            "--dur": c.duration
          };

          return (
            <div
              key={c.id}
              className="absolute -top-24 rounded-full bg-white/60 backdrop-blur-sm shadow-md animate-[coin-fall_var(--dur)_linear_infinite]"
              style={coinStyle}
            >
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                <Image src="/YU-coin.png" alt="YU coin" width={c.size} height={c.size} className="object-contain" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="max-w-7xl mx-auto p-6 relative z-10">
        <div className="flex gap-8">
          {/* Enhanced Sidebar */}
          <aside className="hidden lg:block w-72">
            <div className="sticky top-6 space-y-4">
              {/* Profile Card */}
              <Card hover={false} className="bg-gradient-to-br from-white to-gray-50/50 border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <ClientOnly fallback={
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {currentUserName.split(' ').map(n => n[0]).join('')}
                      </div>
                      }>
                        <Image
                          src={avatar}
                          alt="avatar"
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-2xl object-cover shadow-lg"
                        />
                      </ClientOnly>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{currentUserName.split(' ')[0]}</p>
                      <p className="text-sm text-gray-500">Студент • Уровень {state.level}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-xl text-center border border-blue-100">
                      <ClientOnly 
                        fallback={<div className="text-2xl font-bold text-blue-600">50000</div>}
                      >
                        <div className="text-2xl font-bold text-blue-600">{animatedCoins}</div>
                      </ClientOnly>
                      <div className="text-xs text-blue-500 font-medium">YU-coins</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-xl text-center border border-purple-100">
                      <div className="text-2xl font-bold text-purple-600">{state.streak}</div>
                      <div className="text-xs text-purple-500 font-medium">Дней</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <Card hover={false} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    Навигация
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { id: 'dashboard', icon: Home, label: 'Главная', badge: null },
                    { id: 'quests', icon: Target, label: 'Квесты', badge: visibleQuests.filter(q => !q.completed).length },
                    { id: 'achievements', icon: Award, label: 'Достижения', badge: 3 },
                    { id: 'events', icon: Calendar, label: 'События', badge: 2 },
                    { id: 'leaders', icon: Trophy, label: 'Рейтинг', badge: null },
                    { id: 'news', icon: Newspaper, label: 'Новости', badge: null },
                    { id: 'profile', icon: Users, label: 'Профиль', badge: null },
                    { id: 'shop', icon: ShoppingBag, label: 'Магазин', badge: null },
                  ].map(({ id, icon: Icon, label, badge }) => (
                    <button
                      key={id}
                      onClick={() => {
                        if (id === 'shop') {
                          router.push('/YU-Gamification/shop')
                        } else if (id === 'news') {
                          router.push('/main/news')
                        } else {
                          setActiveTab(id as Tab)
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                        activeTab === id 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{label}</span>
                      {badge && (
                        <span className={`ml-auto px-2 py-1 rounded-full text-xs font-bold ${
                          activeTab === id ? 'bg-white/20' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {badge}
                        </span>
                      )}
                    </button>
                  ))}
                </CardContent>

              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {activeTab === 'dashboard' && (
              <>
                {/* Hero Section */}
                <div className="relative overflow-hidden">
                  <Card hover={false} className="border-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white shadow-2xl">
                    <div className="absolute inset-0">
                      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                      <div className="absolute bottom-10 right-10 w-24 h-24 bg-yellow-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
                      <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-pink-300/15 rounded-full blur-xl animate-bounce"></div>
                    </div>
                    
                    <CardContent className="relative z-10 p-8">
                      <div className="flex items-center justify-between">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Crown className="w-8 h-8 text-yellow-300" />
                              </div>
                              <h1 className="text-4xl font-bold">Привет, {currentUserName.split(' ')[0]}!</h1>
                            </div>
                            <p className="text-xl text-white/80">Добро пожаловать в вашу геймификационную панель</p>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-5 h-5 text-yellow-300" />
                                <span className="text-white/90 text-sm font-medium">Уровень</span>
                              </div>
                              <p className="text-3xl font-bold">{state.level}</p>
                            </div>
                            
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Image src="/YU-coin.png" alt="YU coin" width={28} height={28} className="w-12 h-12" />
                                <span className="text-white/90 text-sm font-medium">YU-coins</span>
                              </div>
                              <ClientOnly 
                                fallback={<p className="text-3xl font-bold">50000</p>}
                              >
                              <p className="text-3xl font-bold">{animatedCoins}</p>
                              </ClientOnly>
                            </div>
                            
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Flame className="w-5 h-5 text-yellow-300" />
                                <span className="text-white/90 text-sm font-medium">Серия</span>
                              </div>
                              <p className="text-3xl font-bold">{state.streak}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="relative w-24 h-24">
                              <svg viewBox="0 0 36 36" className="w-24 h-24 transform -rotate-90">
                                <path
                                  className="text-white/20"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  fill="none"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                  className="text-yellow-300"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeDasharray={`${animatedLevel}, 100`}
                                  strokeLinecap="round"
                                  fill="none"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">{animatedLevel}%</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <p className="text-white/90 font-medium">Прогресс до следующего уровня</p>
                              <Progress value={animatedLevel} className="w-64 h-3 bg-white/20" />
                              <p className="text-white/70 text-sm">{state.xp} / {state.xpNeeded} XP</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <button
                              onClick={claimDaily}
                              disabled={claimedToday}
                              className={`px-6 py-3 rounded-2xl font-bold shadow-lg transition-all duration-200 ${
                                claimedToday 
                                  ? 'bg-white/30 text-white/60 cursor-not-allowed' 
                                  : 'bg-white text-blue-700 hover:bg-gray-100 hover:shadow-xl transform hover:scale-105'
                              }`}
                            >
                              {claimedToday ? 'Подарок получен' : '+50 YU-coins алу'}
                            </button>
                            
                            <div className="text-white/80 text-sm">
                              {claimedToday ? 'Возвращайтесь завтра!' : 'Ежедневная награда доступна'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="hidden xl:block">
                          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="text-center space-y-3">
                              <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center">
                                <Trophy className="w-8 h-8 text-yellow-300" />
                              </div>
                              <div>
                                <p className="text-white/90 text-sm font-medium">Ваше место</p>
                                <p className="text-2xl font-bold text-yellow-300">#{userRank}</p>
                              </div>
                              <p className="text-white/70 text-xs">из {leaderboard.length} студентов</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  <StatCard
                    title="Активная серия"
                    value={String(state.streak)}
                    subtitle="дней подряд активности"
                    icon={<Flame className="w-8 h-8" />}
                    gradient="from-orange-400 to-red-500"
                    trend="up"
                  />
                  <StatCard
                    title="Завершенных квестов"
                    value={String(quests.filter(q => q.completed).length)}
                    subtitle="в текущем месяце"
                    icon={<Target className="w-8 h-8" />}
                    gradient="from-green-400 to-emerald-500"
                    trend="up"
                  />
                  <StatCard
                    title="Место в рейтинге"
                    value={`#${userRank}`}
                    subtitle={`из ${leaderboard.length} студентов`}
                    icon={<Trophy className="w-8 h-8" />}
                    gradient="from-amber-400 to-yellow-500"
                    trend="up"
                  />
                  <StatCard
                    title="До следующей награды"
                    value="125"
                    subtitle="YU-coins қалды"
                    icon={<Gift className="w-8 h-8" />}
                    gradient="from-purple-400 to-pink-500"
                    trend="neutral"
                  />
                </div>

                {/* Active Quests Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">Активные квесты</h2>
                        <p className="text-gray-500">Выполняйте задания и зарабатывайте награды</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {(['all', 'active', 'completed'] as QuestFilter[]).map(f => (
                        <button
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            filter === f 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {f === 'all' ? 'Все' : f === 'active' ? 'Активные' : 'Завершенные'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {visibleQuests.map(quest => (
                      <QuestCard
                        key={quest.id}
                        title={quest.title}
                        description={quest.description}
                        difficulty={quest.difficulty}
                        category={quest.category}
                        type={quest.type}
                        progress={Math.round((quest.current / quest.total) * 100)}
                        current={quest.current}
                        total={quest.total}
                        rewards={quest.rewards}
                        icon={quest.icon}
                        onAction={undefined} // Disable interaction in dashboard - use quests tab for actions
                        disabled={true} // Always disabled in dashboard view
                        completed={quest.completed}
                        unlocked={quest.unlocked}
                        deadline={quest.deadline}
                        chainStep={quest.chainStep}
                        requiredLevel={quest.requiredLevel}
                        userLevel={state.level}
                      />
                    ))}
                  </div>
                </div>

                {/* Quick Actions & Leaderboard */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Quick Actions */}
                  <div className="xl:col-span-1">
                    <Card hover={false}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-blue-500" />
                          Быстрые действия
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <ActionButton
                          icon={<ShoppingBag className="w-6 h-6" />}
                          label="Магазин"
                          subtitle="YU-coins жұмсау"
                          color="from-green-400 to-emerald-500"
                          onClick={() => router.push('/YU-Gamification/shop')}
                          badge={shopItems.length}
                        />
                        <ActionButton
                          icon={<Calendar className="w-6 h-6" />}
                          label="События"
                          subtitle="Активности"
                          color="from-purple-400 to-pink-500"
                          onClick={() => setActiveTab('events')}
                          badge={2}
                        />
                        <ActionButton
                          icon={<Users className="w-6 h-6" />}
                          label="Профиль"
                          subtitle="Настройки"
                          color="from-blue-400 to-indigo-500"
                          onClick={() => setActiveTab('profile')}
                        />
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Leaderboard */}
                  <Card hover={false} className="xl:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-amber-500" />
                        Таблица лидеров
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {leaderboard.slice(0, 6).map((leader, index) => (
                        <LeaderItem
                          key={index}
                          rank={index + 1}
                          name={leader.name}
                          coins={leader.coins}
                          isTop={index < 3}
                          isUser={leader.name === currentUserName}

                        />
                      ))}
                      
                      <div className="pt-4 border-t border-gray-100">
                        <button 
                          onClick={() => setActiveTab('leaders')}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-2xl font-bold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                        >
                          Посмотреть полный рейтинг
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* Other Tabs */}
            {activeTab === 'quests' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">Все квесты</h2>
                    <p className="text-gray-500">Выполняйте задания и получайте награды</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  {/* Статус фильтры */}
                  <div className="flex gap-3">
                  {(['all', 'active', 'completed'] as QuestFilter[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                        filter === f 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {f === 'all' ? 'Все квесты' : f === 'active' ? 'Активные' : 'Завершенные'}
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-white/20">
                        {f === 'all' ? quests.length : f === 'active' ? quests.filter(q => !q.completed).length : quests.filter(q => q.completed).length}
                      </span>
                    </button>
                  ))}
                  </div>
                  
                  {/* Категория фильтры */}
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'academic', 'social', 'achievement', 'daily', 'event', 'normal', 'weekly', 'urgent', 'chain'] as CategoryFilter[]).map(cat => {
                      const categoryLabels: Record<CategoryFilter, { label: string; icon: string }> = {
                        all: { label: 'Все категории', icon: '📋' },
                        academic: { label: 'Учебные', icon: '📚' },
                        social: { label: 'Социальные', icon: '🤝' },
                        achievement: { label: 'Достижения', icon: '🏆' },
                        daily: { label: 'Ежедневные', icon: '📅' },
                        event: { label: 'События', icon: '🎉' },
                        normal: { label: 'Обычные', icon: '📝' },
                        weekly: { label: 'Еженедельные', icon: '📆' },
                        urgent: { label: 'Срочные', icon: '⚡' },
                        chain: { label: 'Цепочки', icon: '🔗' },
                      }
                      
                      const config = categoryLabels[cat]
                      const count = cat === 'all' ? quests.length : quests.filter(q => q.category === cat || q.type === cat).length
                      
                      return (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            categoryFilter === cat 
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {config.icon} {config.label}
                          <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
                            {count}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {visibleQuests.map(quest => (
                    <QuestCard
                      key={quest.id}
                      title={quest.title}
                      description={quest.description}
                      difficulty={quest.difficulty}
                      category={quest.category}
                      type={quest.type}
                      progress={Math.round((quest.current / quest.total) * 100)}
                      current={quest.current}
                      total={quest.total}
                      rewards={quest.rewards}
                      icon={quest.icon}
                      onAction={() => handleQuestAction(quest.id)}
                      disabled={quest.completed}
                      completed={quest.completed}
                      unlocked={quest.unlocked}
                      deadline={quest.deadline}
                      chainStep={quest.chainStep}
                      requiredLevel={quest.requiredLevel}
                      userLevel={state.level}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'shop' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl">
                    <ShoppingBag className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">Магазин наград</h2>
                    <p className="text-gray-500">Обменяйте собранные YU-coins на полезные подарки</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center">
                        <Image src="/YU-coin.png" alt="YU coin" width={32} height={32} className="w-12 h-12" />
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Ваш баланс</p>
                        <p className="text-3xl font-bold text-gray-800">{state.coins} YU-coins</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-sm">Место в рейтинге</p>
                      <p className="text-2xl font-bold text-blue-600">#{userRank}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shopItems.map(item => (
                    <Card key={item.id} className="group hover:shadow-xl">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="text-4xl">{item.icon}</div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-amber-600 font-bold text-lg">
                                <Image src="/YU-coin.png" alt="YU coin" width={28} height={28} className="w-12 h-12" />
                                {item.cost}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                          </div>
                          
                          <button
                            onClick={() => purchase(item.id)}
                            disabled={state.coins < item.cost}
                            className={`w-full py-3 rounded-xl font-bold transition-all duration-200 ${
                              state.coins >= item.cost
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {state.coins >= item.cost ? 'Сатып алу' : 'YU-coins жеткіліксіз'}
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'leaders' && (
              <div className="space-y-8">
                {/* Header */}
                <div className="relative overflow-hidden">
                  <Card hover={false} className="border-0 bg-gradient-to-br from-amber-600 via-yellow-600 to-orange-600 text-white shadow-2xl">
                    <div className="absolute inset-0">
                      <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                      <div className="absolute bottom-10 left-10 w-24 h-24 bg-yellow-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
                      <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-orange-300/15 rounded-full blur-xl animate-bounce"></div>
                    </div>
                    
                    <CardContent className="relative z-10 p-8">
                      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
                        <div className="text-center lg:text-left">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/10">
                              <Trophy className="w-10 h-10 text-yellow-200" />
                  </div>
                  <div>
                              <h1 className="text-4xl font-bold mb-1">Таблица лидеров</h1>
                              <p className="text-white/80">Соревнуйтесь с лучшими студентами университета</p>
                  </div>
                </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                              <div className="text-2xl font-bold">{leaderboard.length}</div>
                              <div className="text-white/80 text-sm">Участников</div>
                            </div>
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                              <div className="text-2xl font-bold">#{userRank}</div>
                              <div className="text-white/80 text-sm">Ваше место</div>
                            </div>
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                              <div className="text-2xl font-bold">{Math.max(0, leaderboard[0]?.coins - state.earnedCoins).toLocaleString()}</div>
                              <div className="text-white/80 text-sm">До лидера</div>
                            </div>
                          </div>
                        </div>

                        {/* User's position highlight */}
                        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                          <ClientOnly fallback={
                            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-2xl shadow-xl mx-auto mb-3">
                              {currentUserName.split(' ').map(n => n[0]).join('')}
                            </div>
                          }>
                            <Image
                              src={avatar}
                              alt="avatar"
                              width={64}
                              height={64}
                              className="w-16 h-16 rounded-2xl object-cover shadow-xl mx-auto mb-3 border-2 border-white/30"
                            />
                          </ClientOnly>
                          <div className="font-bold text-lg">{currentUserName.split(' ')[0]}</div>
                          <div className="text-white/80 text-sm">#{userRank} место</div>
                          <div className="flex items-center justify-center gap-1 mt-2 font-bold">
                            <Image src="/YU-coin.png" alt="YU coin" width={20} height={20} className="w-5 h-5" />
                            <span>{state.earnedCoins.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Filters */}
                <Card hover={false} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">Фильтры:</span>
                        <div className="flex gap-2">
                          {['Все', 'Топ-10', 'Мой факультет', 'Мой курс'].map(filter => (
                            <button
                              key={filter}
                              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-gray-100 text-gray-600 hover:bg-gray-200"
                            >
                              {filter}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">Период:</span>
                        <div className="flex gap-2">
                          {['Неделя', 'Месяц', 'Весь период'].map(period => (
                            <button
                              key={period}
                              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                period === 'Весь период' 
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {period}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Podium for top 3 */}
                <Card hover={false} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 overflow-hidden">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-100/50 to-yellow-100/50"></div>
                    <CardContent className="relative z-10 p-8">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">🏆 Топ-3 лидера</h3>
                        <p className="text-gray-600">Лучшие студенты этого периода</p>
                      </div>
                      
                      <div className="flex items-end justify-center gap-4 lg:gap-8">
                      {/* 2nd Place */}
                      {leaderboard[1] && (
                          <div className="flex flex-col items-center group">
                            <div className="relative mb-4">
                              {leaderboard[1].name === currentUserName ? (
                                <ClientOnly fallback={
                              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-400 to-gray-500 text-white flex items-center justify-center font-bold text-2xl shadow-xl border-4 border-white group-hover:scale-110 transition-transform duration-300">
                            2
                          </div>
                                }>
                                  <div className="relative">
                                    <Image
                                      src={avatar}
                                      alt="avatar"
                                      width={80}
                                      height={80}
                                      className="w-20 h-20 rounded-3xl object-cover shadow-xl border-4 border-white group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center font-bold text-white text-sm border-2 border-white">
                                      2
                                    </div>
                                  </div>
                                </ClientOnly>
                              ) : (
                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-400 to-gray-500 text-white flex items-center justify-center font-bold text-2xl shadow-xl border-4 border-white group-hover:scale-110 transition-transform duration-300">
                                  2
                                </div>
                              )}
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-300 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                                <Medal className="w-4 h-4 text-gray-600" />
                              </div>
                            </div>
                            <div className="text-center mb-6">
                              <p className="font-bold text-gray-800 text-lg mb-1">{leaderboard[1].name}</p>
                            <div className="flex items-center justify-center gap-1 text-amber-600 font-bold">
                                <Image src="/YU-coin.png" alt="YU coin" width={20} height={20} className="w-5 h-5" />
                                <span>{(leaderboard[1].name === currentUserName ? state.earnedCoins : leaderboard[1].coins).toLocaleString()}</span>
                            </div>
                              <div className="text-xs text-gray-500 mt-1">Серебро</div>
                          </div>
                            <div className="bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-3xl shadow-lg" style={{ width: 100, height: 80 }}>
                              <div className="w-full h-full rounded-t-3xl bg-gradient-to-t from-gray-400/80 to-gray-300/80"></div>
                            </div>
                        </div>
                      )}
                      
                      {/* 1st Place */}
                      {leaderboard[0] && (
                          <div className="flex flex-col items-center group">
                            <Crown className="w-10 h-10 text-amber-500 mb-2 animate-bounce" />
                            <div className="relative mb-4">
                              {leaderboard[0].name === currentUserName ? (
                                <ClientOnly fallback={
                              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white flex items-center justify-center font-bold text-3xl shadow-2xl border-4 border-white group-hover:scale-110 transition-transform duration-300">
                            1
                          </div>
                                }>
                                  <div className="relative">
                                    <Image
                                      src={avatar}
                                      alt="avatar"
                                      width={112}
                                      height={112}
                                      className="w-28 h-28 rounded-3xl object-cover shadow-2xl border-4 border-white group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center font-bold text-white text-lg border-2 border-white">
                                      1
                                    </div>
                                  </div>
                                </ClientOnly>
                              ) : (
                                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white flex items-center justify-center font-bold text-3xl shadow-2xl border-4 border-white group-hover:scale-110 transition-transform duration-300">
                                  1
                                </div>
                              )}
                              <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                                <Crown className="w-5 h-5 text-yellow-800" />
                              </div>
                              {leaderboard[0].name === currentUserName && (
                                <div className="absolute -bottom-2 -left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                  ВЫ!
                                </div>
                              )}
                            </div>
                            <div className="text-center mb-6">
                              <p className="font-bold text-gray-800 text-xl mb-1">{leaderboard[0].name}</p>
                            <div className="flex items-center justify-center gap-1 text-amber-600 font-bold text-lg">
                                <Image src="/YU-coin.png" alt="YU coin" width={24} height={24} className="w-6 h-6" />
                                <span>{(leaderboard[0].name === currentUserName ? state.earnedCoins : leaderboard[0].coins).toLocaleString()}</span>
                            </div>
                              <div className="text-sm text-amber-600 mt-1 font-medium">👑 Чемпион</div>
                          </div>
                            <div className="bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-3xl shadow-xl" style={{ width: 120, height: 100 }}>
                              <div className="w-full h-full rounded-t-3xl bg-gradient-to-t from-amber-500/80 to-amber-400/80"></div>
                            </div>
                        </div>
                      )}
                      
                      {/* 3rd Place */}
                      {leaderboard[2] && (
                          <div className="flex flex-col items-center group">
                            <div className="relative mb-4">
                              {leaderboard[2].name === currentUserName ? (
                                <ClientOnly fallback={
                              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center font-bold text-2xl shadow-xl border-4 border-white group-hover:scale-110 transition-transform duration-300">
                            3
                          </div>
                                }>
                                  <div className="relative">
                                    <Image
                                      src={avatar}
                                      alt="avatar"
                                      width={80}
                                      height={80}
                                      className="w-20 h-20 rounded-3xl object-cover shadow-xl border-4 border-white group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center font-bold text-white text-sm border-2 border-white">
                                      3
                                    </div>
                                  </div>
                                </ClientOnly>
                              ) : (
                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center font-bold text-2xl shadow-xl border-4 border-white group-hover:scale-110 transition-transform duration-300">
                                  3
                                </div>
                              )}
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-400 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                                <Award className="w-4 h-4 text-orange-800" />
                              </div>
                            </div>
                            <div className="text-center mb-6">
                              <p className="font-bold text-gray-800 text-lg mb-1">{leaderboard[2].name}</p>
                            <div className="flex items-center justify-center gap-1 text-amber-600 font-bold">
                                <Image src="/YU-coin.png" alt="YU coin" width={20} height={20} className="w-5 h-5" />
                                <span>{(leaderboard[2].name === currentUserName ? state.earnedCoins : leaderboard[2].coins).toLocaleString()}</span>
                            </div>
                              <div className="text-xs text-gray-500 mt-1">Бронза</div>
                          </div>
                            <div className="bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-3xl shadow-lg" style={{ width: 100, height: 60 }}>
                              <div className="w-full h-full rounded-t-3xl bg-gradient-to-t from-orange-500/80 to-orange-400/80"></div>
                            </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  </div>
                </Card>

                {/* Full Leaderboard */}
                <Card hover={false}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-500" />
                        Полный рейтинг
                      </CardTitle>
                      <div className="text-sm text-gray-500">
                        Показано {leaderboard.length} из {leaderboard.length} участников
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-0">
                      {leaderboard.map((leader, index) => {
                        const isUser = leader.name === currentUserName
                        const isTop3 = index < 3
                        return (
                          <div
                          key={index}
                            className={`flex items-center justify-between p-6 transition-all duration-200 border-b border-gray-50 last:border-b-0 relative overflow-hidden ${
                              isUser 
                                ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-md' 
                                : isTop3 
                                ? 'bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            {/* Rank Badge */}
                            <div className="flex items-center gap-6">
                              <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                                index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg scale-110' :
                                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-lg' :
                                index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg' : 
                                isUser ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg' :
                                'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'
                              }`}>
                                {index + 1}
                                {isTop3 && (
                                  <div className="absolute -top-1 -right-1">
                                    {index === 0 && <Crown className="w-4 h-4 text-amber-400" />}
                                    {index === 1 && <Medal className="w-4 h-4 text-gray-300" />}
                                    {index === 2 && <Award className="w-4 h-4 text-orange-400" />}
                                  </div>
                                )}
                              </div>
                              
                              {/* User Info */}
                              <div className="flex items-center gap-4">
                                <ClientOnly fallback={
                                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                    {leader.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                }>
                                  {isUser ? (
                                    <Image
                                      src={avatar}
                                      alt="avatar"
                                      width={48}
                                      height={48}
                                      className="w-12 h-12 rounded-2xl object-cover shadow-lg border-2 border-blue-300"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm shadow-lg">
                                      {leader.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                  )}
                                </ClientOnly>
                                
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`font-semibold text-lg ${isUser ? 'text-blue-700' : 'text-gray-800'}`}>
                                      {leader.name}
                                    </span>
                                    {isUser && (
                                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-bold">ВЫ</span>
                                    )}
                                    {isTop3 && !isUser && (
                                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                                        {index === 0 ? '👑 Лидер' : index === 1 ? '🥈 2-е место' : '🥉 3-е место'}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <span>Студент</span>
                                    <span>•</span>
                                    <span>Информационные технологии</span>
                                    {isTop3 && (
                                      <>
                                        <span>•</span>
                                        <span className="text-amber-600 font-medium">Топ-3</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Score and Stats */}
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <div className="flex items-center gap-2 font-bold text-xl text-amber-600">
                                  <Image src="/YU-coin.png" alt="YU coin" width={24} height={24} className="w-6 h-6" />
                                  <span>{(leader.name === currentUserName ? state.earnedCoins : leader.coins).toLocaleString()}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {index === 0 ? 'Лидер' : `+${((leader.name === currentUserName ? state.earnedCoins : leader.coins) - (leaderboard[index + 1]?.name === currentUserName ? state.earnedCoins : leaderboard[index + 1]?.coins || 0)).toLocaleString()} от следующего`}
                                </div>
                              </div>
                              
                              {/* Trend */}
                              <div className="flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  index < 3 ? 'bg-green-100 text-green-600' : 
                                  index < leaderboard.length / 2 ? 'bg-blue-100 text-blue-600' : 
                                  'bg-gray-100 text-gray-500'
                                }`}>
                                  <TrendingUp className="w-3 h-3" />
                                </div>
                                <div className="text-xs text-gray-400 mt-1">↗</div>
                              </div>
                            </div>
                            
                            {/* Background pattern for user */}
                            {isUser && (
                              <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600"></div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card hover={false} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8 text-white" />
              </div>
                      <div className="text-3xl font-bold text-blue-600 mb-1">{leaderboard[0]?.coins.toLocaleString()}</div>
                      <div className="text-blue-500 text-sm font-medium">Лучший результат</div>
                    </CardContent>
                  </Card>
                  
                  <Card hover={false} className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-white" />
                  </div>
                      <div className="text-3xl font-bold text-green-600 mb-1">{Math.round(leaderboard.reduce((sum, l) => sum + l.coins, 0) / leaderboard.length).toLocaleString()}</div>
                      <div className="text-green-500 text-sm font-medium">Средний балл</div>
                    </CardContent>
                  </Card>
                  
                  <Card hover={false} className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-white" />
                  </div>
                      <div className="text-3xl font-bold text-purple-600 mb-1">{userRank <= 3 ? '🔥' : userRank <= 10 ? '💪' : '📈'}</div>
                      <div className="text-purple-500 text-sm font-medium">
                        {userRank <= 3 ? 'Вы в топе!' : userRank <= 10 ? 'Почти в топе' : 'Есть куда расти'}
                </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Profile Header */}
                <div className="relative overflow-hidden">
                  <Card hover={false} className="border-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl">
                    <div className="absolute inset-0">
                      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                      <div className="absolute bottom-10 right-10 w-24 h-24 bg-yellow-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
                      <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-pink-300/15 rounded-full blur-xl animate-bounce"></div>
                    </div>
                    
                    <CardContent className="relative z-10 p-8">
                      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                        {/* Avatar Section */}
                        <div className="flex-shrink-0 text-center lg:text-left">
                        <div className="relative inline-block">
                            <ClientOnly fallback={
                              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-white font-bold text-4xl shadow-2xl border-4 border-white/20">
                            {currentUserName.split(' ').map(n => n[0]).join('')}
                          </div>
                            }>
                              <Image
                                src={avatar}
                                alt="avatar"
                                width={128}
                                height={128}
                                className="w-32 h-32 rounded-3xl object-cover shadow-2xl border-4 border-white/20"
                              />
                            </ClientOnly>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                              <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                            </div>
                            <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-400 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                              <Crown className="w-4 h-4 text-yellow-800" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Profile Info */}
                        <div className="flex-1 space-y-6">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{currentUserName}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-white/80">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span>Активный студент</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Зарегистрирован: Сентябрь 2023</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4" />
                                <span>Место в рейтинге: #{userRank}</span>
                              </div>
                            </div>
                        </div>
                        
                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Image src="/YU-coin.png" alt="YU coin" width={24} height={24} className="w-6 h-6" />
                                <span className="text-white/90 text-sm font-medium">Текущие</span>
                            </div>
                              <p className="text-2xl font-bold">{state.coins.toLocaleString()}</p>
                              <p className="text-white/70 text-xs">YU-coins</p>
                          </div>
                            
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Image src="/YU-coin.png" alt="YU coin" width={24} height={24} className="w-6 h-6" />
                                <span className="text-white/90 text-sm font-medium">Заработано</span>
                            </div>
                              <p className="text-2xl font-bold">{state.earnedCoins.toLocaleString()}</p>
                              <p className="text-white/70 text-xs">Всего</p>
                          </div>
                            
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-5 h-5 text-yellow-300" />
                                <span className="text-white/90 text-sm font-medium">Уровень</span>
                            </div>
                              <p className="text-2xl font-bold">{state.level}</p>
                              <p className="text-white/70 text-xs">{state.xp}/{state.xpNeeded} XP</p>
                          </div>
                            
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Flame className="w-5 h-5 text-orange-300" />
                                <span className="text-white/90 text-sm font-medium">Серия</span>
                              </div>
                              <p className="text-2xl font-bold">{state.streak}</p>
                              <p className="text-white/70 text-xs">дней подряд</p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-white/90 text-sm font-medium">Прогресс до уровня {state.level + 1}</span>
                              <span className="text-white/70 text-sm">{Math.round((state.xp / state.xpNeeded) * 100)}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-yellow-300 to-orange-400 h-3 rounded-full transition-all duration-1000 ease-out relative"
                                style={{ width: `${(state.xp / state.xpNeeded) * 100}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Achievements */}
                  <Card hover={false} className="xl:col-span-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Award className="w-6 h-6 text-amber-500" />
                          Достижения
                        </CardTitle>
                        <div className="text-sm text-gray-500">
                          {[true, true, true, userRank <= 10, true, false, false, false].filter(Boolean).length} из 8 получено
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Achievement 
                          icon={<Star className="w-8 h-8 text-yellow-500" />} 
                          title="Отличник" 
                          description="Посетил 50+ лекций" 
                          earned={true}
                          rarity="rare"
                        />
                        <Achievement 
                          icon={<Trophy className="w-8 h-8 text-green-500" />} 
                          title="Первая сотня" 
                          description="100 YU-coins заработано" 
                          earned={true}
                          rarity="common"
                        />
                        <Achievement 
                          icon={<Image src="/YU-coin.png" alt="YU coin" width={32} height={32} className="w-8 h-8" />} 
                          title="Богач" 
                          description="50000+ YU-coins заработано"
                          earned={true}
                          rarity="epic"
                        />
                        <Achievement 
                          icon={<Crown className="w-8 h-8 text-purple-500" />} 
                          title="Топ-10" 
                          description="Попал в топ-10 рейтинга" 
                          earned={userRank <= 10}
                          rarity="legendary"
                        />
                        <Achievement 
                          icon={<Flame className="w-8 h-8 text-orange-500" />} 
                          title="Неделя подряд" 
                          description="7 дней активности" 
                          earned={true}
                          rarity="common"
                        />
                        <Achievement 
                          icon={<Users className="w-8 h-8 text-blue-500" />} 
                          title="Помощник" 
                          description="Помог 10 однокурсникам" 
                          earned={false}
                          rarity="rare"
                        />
                        <Achievement 
                          icon={<Target className="w-8 h-8 text-green-500" />} 
                          title="Квестомастер" 
                          description="Завершил 25 квестов" 
                          earned={false}
                          rarity="epic"
                        />
                        <Achievement 
                          icon={<Gift className="w-8 h-8 text-pink-500" />} 
                          title="Щедрость" 
                          description="Потратил 10000 коинов" 
                          earned={false}
                          rarity="rare"
                        />
                      </div>

                      {/* Achievement Progress */}
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3">Прогресс достижений</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Топ-10 рейтинга</span>
                            <span className="text-sm font-medium text-gray-800">#{userRank}/10</span>
                          </div>
                          <Progress value={userRank <= 10 ? 100 : Math.max(0, 100 - (userRank - 10) * 2)} className="h-2" />
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Квестомастер</span>
                            <span className="text-sm font-medium text-gray-800">{quests.filter(q => q.completed).length}/25</span>
                          </div>
                          <Progress value={(quests.filter(q => q.completed).length / 25) * 100} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity & Stats */}
                  <div className="space-y-6">
                  {/* Recent Activity */}
                  <Card hover={false}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-500" />
                          Последняя активность
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activity.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500">Пока нет активности</p>
                        </div>
                      ) : (
                          <div className="space-y-3">
                          {activity.map(item => (
                              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <Target className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-800 text-sm truncate">{item.title}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(item.timestamp).toLocaleString('ru-RU')}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 font-bold text-green-600 flex-shrink-0">
                                  <span className="text-sm">+{item.reward}</span>
                                  <Image src="/YU-coin.png" alt="YU coin" width={16} height={16} className="w-4 h-4" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                    {/* Profile Stats */}
                    <Card hover={false}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                          Статистика
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-xl">
                            <div className="text-2xl font-bold text-blue-600">{quests.filter(q => q.completed).length}</div>
                            <div className="text-xs text-blue-500">Квестов завершено</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-xl">
                            <div className="text-2xl font-bold text-green-600">{Math.floor(state.earnedCoins / 1000)}k</div>
                            <div className="text-xs text-green-500">Всего заработано</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-xl">
                            <div className="text-2xl font-bold text-purple-600">{state.streak}</div>
                            <div className="text-xs text-purple-500">Дней активности</div>
                          </div>
                          <div className="text-center p-3 bg-amber-50 rounded-xl">
                            <div className="text-2xl font-bold text-amber-600">#{userRank}</div>
                            <div className="text-xs text-amber-500">В рейтинге</div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Активность за месяц</span>
                            <span className="font-medium text-gray-800">87%</span>
                          </div>
                          <Progress value={87} className="mt-2 h-2" />
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">До следующего уровня</span>
                            <span className="font-medium text-gray-800">{state.xpNeeded - state.xp} XP</span>
                          </div>
                          <Progress value={(state.xp / state.xpNeeded) * 100} className="mt-2 h-2" />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Achievements Preview */}
                    <Card hover={false} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-600" />
                          Достижения
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-white rounded-xl border border-amber-100">
                            <div className="text-2xl font-bold text-green-600">5</div>
                            <div className="text-xs text-gray-600">Получено</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded-xl border border-amber-100">
                            <div className="text-2xl font-bold text-blue-600">12</div>
                            <div className="text-xs text-gray-600">В процессе</div>
                          </div>
                        </div>
                        
                        {/* Recent achievements */}
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-gray-600 mb-2">Недавние</div>
                          {[
                            { icon: '🎯', name: 'Первые шаги', rarity: 'common' },
                            { icon: '📚', name: 'Книжный червь', rarity: 'uncommon' },
                            { icon: '⚡', name: 'Молниеносный', rarity: 'rare' }
                          ].map((ach, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-amber-100">
                              <div className="text-lg">{ach.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-800 truncate">{ach.name}</div>
                                <div className={`text-xs capitalize ${
                                  ach.rarity === 'common' ? 'text-gray-500' :
                                  ach.rarity === 'uncommon' ? 'text-green-500' :
                                  'text-blue-500'
                                }`}>
                                  {ach.rarity === 'common' ? 'Обычное' :
                                   ach.rarity === 'uncommon' ? 'Необычное' :
                                   'Редкое'}
                                </div>
                              </div>
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <Star className="w-3 h-3 text-green-600" />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <button 
                          onClick={() => setActiveTab('achievements')}
                          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                        >
                          Смотреть все
                        </button>
                      </CardContent>
                    </Card>

                    {/* Events Preview */}
                    <Card hover={false} className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-purple-600" />
                          Предстоящие события
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { 
                            title: 'YU Hackathon 2024',
                            time: 'Через 7 дней',
                            participants: 87,
                            category: 'competition',
                            icon: '🏆'
                          },
                          { 
                            title: 'Ярмарка карьеры',
                            time: 'Через 3 дня',
                            participants: 234,
                            category: 'academic',
                            icon: '📚'
                          }
                        ].map((event, index) => (
                          <div key={index} className="p-3 bg-white rounded-xl border border-purple-100">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{event.icon}</span>
                                <div>
                                  <div className="text-sm font-semibold text-gray-800">{event.title}</div>
                                  <div className="text-xs text-gray-500">{event.time}</div>
                                </div>
                              </div>
                              <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                {event.participants} участников
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <button 
                          onClick={() => setActiveTab('events')}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                        >
                          Все события
                        </button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <EventSystem userStats={state} />
            )}


            {/* потом как нибудь решим */}
            {/* {activeTab === 'achievements' && (
              <AchievementSystem userStats={state} />
            )} */}
          </div>
        </div>
      </div>

      {/* Enhanced Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white font-semibold min-w-[300px] animate-[slideIn_0.3s_ease-out] ${
          toast.type === 'error' 
            ? 'bg-gradient-to-r from-red-500 to-pink-600' 
            : 'bg-gradient-to-r from-green-500 to-emerald-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/20`}>
              {toast.type === 'error' ? (
                <span className="text-xl">⚠️</span>
              ) : (
                <span className="text-xl">🎉</span>
              )}
            </div>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <style jsx>{`
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
        @keyframes coin-fall {
          0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          99% { opacity: 1; }
          100% { transform: translateY(calc(200vh + 320px)) rotate(360deg); opacity: 0; }
        }
              `}</style>
      </div>
    )
  }