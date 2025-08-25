'use client'

import { useState, useEffect, useMemo, cloneElement } from "react"
import Image from "next/image"
import type { ReactNode, ReactElement } from "react"
import { Trophy, Coins, Star, Award, ArrowRight, Zap, Target, Calendar, Users, Gift, Crown, Medal, Flame, ShoppingBag, Home, ChevronRight, Sparkles, TrendingUp } from "lucide-react"
import { useRouter } from 'next/navigation'

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

// Enhanced Quest Card with better visual hierarchy
type QuestCardProps = {
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  progress: number;
  current: number;
  total: number;
  reward: number;
  icon: ReactNode;
  onAction: () => void;
  disabled?: boolean;
  completed?: boolean;
}

function QuestCard(props: QuestCardProps) {
  const { title, difficulty, progress, current, total, reward, icon, onAction, disabled, completed } = props
  
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
            {cloneElement(icon as unknown as ReactElement<any>, { className: 'w-6 h-6' } as any)}
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
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <Image src="/YU-coin.png" alt="YU coin" width={28} height={28} className="w-12 h-12" />
            <span className="font-bold text-amber-600">+{reward}</span>

          </div>
          
          <button
            onClick={onAction}
            disabled={disabled}
            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
              completed 
                ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                : disabled 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : `bg-gradient-to-r ${config.gradient} text-white hover:shadow-lg hover:scale-105 active:scale-95`
            }`}
          >
            {completed ? 'Готово' : 'Выполнить'}
          </button>
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
            {cloneElement(icon as unknown as ReactElement<any>, { className: 'w-7 h-7 text-white' } as any)}
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
          {cloneElement(icon as unknown as ReactElement<any>, { className: 'w-8 h-8' } as any)}
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
          {cloneElement(icon as unknown as ReactElement<any>, { className: 'w-6 h-6' } as any)}
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
  const userName = "Жанарыс Имангалиев"
  const avatar = "/api/placeholder/80/80"
  const router = useRouter()
  
  // Toast system
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null)
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Game state
  type GameState = { 
    coins: number; 
    level: number; 
    xp: number; 
    xpNeeded: number; 
    streak: number; 
    lastActive: string 
  }
  
  const [state, setState] = useState<GameState>({ 
    coins: 1250, 
    level: 8, 
    xp: 175, 
    xpNeeded: 200, 
    streak: 12, 
    lastActive: new Date().toISOString().slice(0,10) 
  })

  type Quest = { 
    id: number; 
    title: string; 
    difficulty: 'easy'|'medium'|'hard'; 
    current: number; 
    total: number; 
    reward: number; 
    icon: ReactElement; 
    completed: boolean 
  }
  
  const [quests, setQuests] = useState<Quest[]>([
    { id: 1, title: 'Посещение лекций', difficulty: 'easy', current: 4, total: 5, reward: 75, icon: <Calendar className="w-6 h-6" />, completed: false },
    { id: 2, title: 'Своевременная сдача работ', difficulty: 'medium', current: 8, total: 10, reward: 150, icon: <Medal className="w-6 h-6" />, completed: false },
    { id: 3, title: 'Активное участие в дискуссиях', difficulty: 'hard', current: 5, total: 10, reward: 300, icon: <Users className="w-6 h-6" />, completed: false },
    { id: 4, title: 'Помощь однокурсникам', difficulty: 'medium', current: 3, total: 7, reward: 200, icon: <Gift className="w-6 h-6" />, completed: false },
  ])

  type Leader = { name: string; coins: number }
  const [leaderboard] = useState<Leader[]>([
    { name: "Жанарыс Имангалиев", coins: 50000 },
    { name: "Айжан Қайратқызы", coins: 18900 },
    { name: "Данияр Әлімжанов", coins: 16750 },
    { name: "Әсел Нұрғалиева", coins: 14300 },
    { name: "Ернар Мақсатұлы", coins: 13850 },
    { name: "Аружан Төлеген", coins: 12500 },
    { name: "Алмат Серік", coins: 11800 },
    { name: "Мадина Бекзат", coins: 10500 },
  ])

  type Activity = { id: number; type: string; title: string; reward: number; timestamp: string }
  const [activity] = useState<Activity[]>([
    { id: 1, type: 'quest', title: 'Посещение лекций', reward: 75, timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, type: 'achievement', title: 'Примерный студент', reward: 100, timestamp: new Date(Date.now() - 7200000).toISOString() },
  ])

  // Navigation
  type Tab = 'dashboard' | 'quests' | 'shop' | 'leaders' | 'events' | 'profile'
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  // Daily reward
  const [claimedToday, setClaimedToday] = useState<boolean>(false)
  
  const claimDaily = () => {
    if (claimedToday) return
    setClaimedToday(true)
    setState(s => ({ ...s, coins: s.coins + 50 }))
    showToast('Күнделікті сыйлық: +50 YU-coins! 🎉', 'success')
  }

  // Quest filters
  type QuestFilter = 'all' | 'active' | 'completed'
  const [filter, setFilter] = useState<QuestFilter>('all')
  
  const visibleQuests = useMemo(() => {
    if (filter === 'active') return quests.filter(q => !q.completed)
    if (filter === 'completed') return quests.filter(q => q.completed)
    return quests
  }, [quests, filter])

  // Animated values
  const [animatedCoins, setAnimatedCoins] = useState(state.coins)
  const [animatedLevel, setAnimatedLevel] = useState(Math.round((state.xp / state.xpNeeded) * 100))

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
  const handleQuestAction = (id: number) => {
    setQuests(prev => prev.map(q => {
      if (q.id !== id || q.completed) return q
      
      const nextCurrent = Math.min(q.total, q.current + 1)
      const completed = nextCurrent >= q.total
      
      if (completed) {
        setState(s => {
          let newXp = s.xp + q.reward
          let newLevel = s.level
          let xpNeeded = s.xpNeeded
          
          while (newXp >= xpNeeded) {
            newXp -= xpNeeded
            newLevel += 1
            xpNeeded = Math.round(xpNeeded * 1.2)
          }
          
          return { ...s, coins: s.coins + q.reward, xp: newXp, level: newLevel, xpNeeded }
        })
        
        showToast(`🎉 Квест аяқталды: +${q.reward} YU-coins`, 'success')
      }
      
      return { ...q, current: nextCurrent, completed }
    }))
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

  const userRank = leaderboard.findIndex(l => l.name === "Жанарыс Имангалиев") + 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Falling YU coins background */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        {coins.map(c => (
          <div
            key={c.id}
            className="absolute -top-24 rounded-full bg-white/60 backdrop-blur-sm shadow-md animate-[coin-fall_var(--dur)_linear_infinite]"
            style={{
              left: c.left,
              width: `${c.size}px`,
              height: `${c.size}px`,
              animationDelay: c.delay as any,
              // @ts-ignore custom property for duration
              "--dur": c.duration as any
            }}
          >
            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
              <Image src="/YU-coin.png" alt="YU coin" width={c.size} height={c.size} className="object-contain" />
            </div>
          </div>
        ))}
        {/* No static pile; coins fall through and fade only at the end */}
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
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {userName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{userName.split(' ')[0]}</p>
                      <p className="text-sm text-gray-500">Студент • Уровень {state.level}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-xl text-center border border-blue-100">
                      <div className="text-2xl font-bold text-blue-600">{state.coins}</div>
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
                    { id: 'leaders', icon: Trophy, label: 'Рейтинг', badge: null },
                    { id: 'profile', icon: Users, label: 'Профиль', badge: null },
                    { id: 'events', icon: Calendar, label: 'События', badge: 2 },
                    { id: 'shop', icon: ShoppingBag, label: 'Магазин', badge: null },
                  ].map(({ id, icon: Icon, label, badge }) => (
                    <button
                      key={id}
                      onClick={() => {
                        if (id === 'shop') {
                          router.push('/YU-Gamification/shop')
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
                              <h1 className="text-4xl font-bold">Привет, {userName.split(' ')[0]}!</h1>
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
                              <p className="text-3xl font-bold">{animatedCoins}</p>
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
                              {claimedToday ? 'Сыйлық алынды' : '+50 YU-coins алу'}
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
                        difficulty={quest.difficulty}
                        progress={Math.round((quest.current / quest.total) * 100)}
                        current={quest.current}
                        total={quest.total}
                        reward={quest.reward}
                        icon={quest.icon}
                        onAction={() => handleQuestAction(quest.id)}
                        disabled={quest.completed}
                        completed={quest.completed}
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
                          isUser={leader.name === "Арсен Каримов"}
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
                
                <div className="flex gap-3 mb-6">
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
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {visibleQuests.map(quest => (
                    <QuestCard
                      key={quest.id}
                      title={quest.title}
                      difficulty={quest.difficulty}
                      progress={Math.round((quest.current / quest.total) * 100)}
                      current={quest.current}
                      total={quest.total}
                      reward={quest.reward}
                      icon={quest.icon}
                      onAction={() => handleQuestAction(quest.id)}
                      disabled={quest.completed}
                      completed={quest.completed}
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
                    <p className="text-gray-500">Жиналған YU-coins пайдалы сыйлықтарға алмастырыңыз</p>
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
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">Таблица лидеров</h2>
                    <p className="text-gray-500">Соревнуйтесь с другими студентами</p>
                  </div>
                </div>

                {/* Podium for top 3 */}
                <Card hover={false} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                  <CardContent className="p-8">
                    <div className="flex items-end justify-center gap-8">
                      {/* 2nd Place */}
                      {leaderboard[1] && (
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 text-white flex items-center justify-center font-bold text-2xl mb-4 shadow-lg">
                            2
                          </div>
                          <div className="text-center mb-4">
                            <p className="font-bold text-gray-800 text-lg">{leaderboard[1].name}</p>
                            <div className="flex items-center justify-center gap-1 text-amber-600 font-bold">
                              <Image src="/YU-coin.png" alt="YU coin" width={24} height={24} className="w-12 h-12" />
                              {leaderboard[1].coins}
                            </div>
                          </div>
                          <div className="bg-gradient-to-t from-gray-300 to-gray-200 rounded-t-2xl" style={{ width: 100, height: 80 }} />
                        </div>
                      )}
                      
                      {/* 1st Place */}
                      {leaderboard[0] && (
                        <div className="flex flex-col items-center">
                          <Crown className="w-8 h-8 text-amber-500 mb-2" />
                          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white flex items-center justify-center font-bold text-3xl mb-4 shadow-xl">
                            1
                          </div>
                          <div className="text-center mb-4">
                            <p className="font-bold text-gray-800 text-xl">{leaderboard[0].name}</p>
                            <div className="flex items-center justify-center gap-1 text-amber-600 font-bold text-lg">
                              <Image src="/YU-coin.png" alt="YU coin" width={28} height={28} className="w-12 h-12" />
                              {leaderboard[0].coins}
                            </div>
                          </div>
                          <div className="bg-gradient-to-t from-amber-400 to-amber-300 rounded-t-2xl" style={{ width: 120, height: 100 }} />
                        </div>
                      )}
                      
                      {/* 3rd Place */}
                      {leaderboard[2] && (
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center font-bold text-2xl mb-4 shadow-lg">
                            3
                          </div>
                          <div className="text-center mb-4">
                            <p className="font-bold text-gray-800 text-lg">{leaderboard[2].name}</p>
                            <div className="flex items-center justify-center gap-1 text-amber-600 font-bold">
                              <Image src="/YU-coin.png" alt="YU coin" width={24} height={24} className="w-12 h-12" />
                              {leaderboard[2].coins}
                            </div>
                          </div>
                          <div className="bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-2xl" style={{ width: 100, height: 60 }} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Full Leaderboard */}
                <Card hover={false}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {leaderboard.map((leader, index) => (
                        <LeaderItem
                          key={index}
                          rank={index + 1}
                          name={leader.name}
                          coins={leader.coins}
                          isTop={index < 3}
                          isUser={leader.name === "Арсен Каримов"}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">Профиль</h2>
                    <p className="text-gray-500">Ваша статистика и достижения</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Profile Info */}
                  <Card hover={false}>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="relative inline-block">
                          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-xl mx-auto">
                            {userName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">{userName}</h3>
                          <p className="text-gray-500">Активный студент</p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 pt-4">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                              <Image src="/YU-coin.png" alt="YU coin" width={32} height={32} className="w-12 h-12" />
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{state.coins}</p>
                            <p className="text-xs text-gray-500">YU-coins</p>
                          </div>
                          <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                              <Zap className="w-6 h-6 text-purple-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{state.level}</p>
                            <p className="text-xs text-gray-500">Уровень</p>
                          </div>
                          <div className="text-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                              <Flame className="w-6 h-6 text-orange-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{state.streak}</p>
                            <p className="text-xs text-gray-500">Дней</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Achievements */}
                  <Card hover={false}>
                    <CardHeader>
                      <CardTitle>Достижения</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
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
                          description="100 YU-coins жинады" 
                          earned={true}
                          rarity="common"
                        />
                        <Achievement 
                          icon={<Image src="/YU-coin.png" alt="YU coin" width={40} height={40} className="w-12 h-12" />} 
                          title="Миллионер" 
                          description="1000+ YU-coins жинады"
                          earned={true}
                          rarity="epic"
                        />
                        <Achievement 
                          icon={<Crown className="w-8 h-8 text-purple-500" />} 
                          title="Топ-10" 
                          description="Попал в топ-10 рейтинга" 
                          earned={false}
                          rarity="legendary"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card hover={false}>
                    <CardHeader>
                      <CardTitle>Последняя активность</CardTitle>
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
                        <div className="space-y-4">
                          {activity.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                  <Target className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(item.timestamp).toLocaleString('ru-RU')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 font-bold text-green-600">
                                <span>+{item.reward}</span>
                                <Image src="/YU-coin.png" alt="YU coin" width={24} height={24} className="w-12 h-12" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">События и активности</h2>
                    <p className="text-gray-500">Специальные мероприятия и челленджи</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Current Events */}
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        Текущие события
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-white rounded-2xl p-4 border border-purple-100">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-gray-800">Неделя отличника</h4>
                            <p className="text-sm text-gray-600">Удвоенные награды за квесты</p>
                          </div>
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
                            Активно
                          </span>
                        </div>
                        <div className="mb-3">
                          <Progress value={65} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">Осталось 2 дня</p>
                        </div>
                        <button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200">
                          Участвовать
                        </button>
                      </div>

                      <div className="bg-white rounded-2xl p-4 border border-blue-100">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-gray-800">Марафон знаний</h4>
                            <p className="text-sm text-gray-600">Ежедневные мини-квесты</p>
                          </div>
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                            Скоро
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">Начинается через 3 дня</p>
                        <button className="w-full bg-gray-100 text-gray-600 py-2 rounded-xl font-semibold cursor-not-allowed">
                          Ожидание
                        </button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Achievements & Rewards */}
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-amber-600" />
                        Специальные награды
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {[
                          { name: 'Эксклюзивный бейдж', desc: 'За участие в событии', cost: 'Участие', available: true },
                          { name: 'Дополнительные XP', desc: '+500 очков опыта', cost: '1 место', available: false },
                          { name: 'Премиум статус', desc: 'На 1 месяц', cost: 'Топ-3', available: false }
                        ].map((reward, index) => (
                          <div key={index} className="bg-white rounded-2xl p-4 border border-amber-100">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-800 text-sm">{reward.name}</h4>
                                <p className="text-xs text-gray-600">{reward.desc}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-semibold text-amber-600">{reward.cost}</p>
                                <div className={`w-3 h-3 rounded-full mt-1 ${reward.available ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Event Calendar */}
                <Card hover={false}>
                  <CardHeader>
                    <CardTitle>Календарь событий</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Скоро появятся новые события!</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Следите за обновлениями, чтобы не пропустить интересные челленджи и получить эксклюзивные награды.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
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