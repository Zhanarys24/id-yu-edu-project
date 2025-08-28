'use client'

import { useMemo, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Coins, ShoppingBag, Home, ChevronRight, Filter, Search, Sparkles, Gift, Star, Clock, Users, Zap, Trophy, Coffee, Shirt, Headphones, Book, Gamepad2, Heart, Shield, Flame, Award, Target } from "lucide-react"

type ShopItem = {
  id: number
  name: string
  cost: number
  desc: string
  icon: string
  category: 'benefit' | 'merch' | 'service'
  variants?: string[]
  popular?: boolean
  discount?: number
  limitedTime?: boolean
  rating?: number
  purchases?: number
}

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

type BadgeVariant = 'default' | 'popular' | 'discount' | 'limited'
const Badge = (props: { children: any; variant?: BadgeVariant; className?: string }) => {
  const { children, variant = 'default', className = "" } = props
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-800',
    popular: 'bg-gradient-to-r from-orange-400 to-red-500 text-white',
    discount: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
    limited: 'bg-gradient-to-r from-purple-400 to-pink-500 text-white'
  }
  const variantKey: BadgeVariant = variant
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${variants[variantKey]} ${className}`}>
      {children}
    </span>
  )
}

export default function ShopPage() {
  const [coins, setCoins] = useState<number>(15750)
  const [query, setQuery] = useState<string>("")
  const [category, setCategory] = useState<'all' | ShopItem['category']>('all')
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null)
  const [selectedVariants, setSelectedVariants] = useState<Record<number, string>>({})
  const [sortBy, setSortBy] = useState<'price' | 'popular' | 'newest'>('popular')
  const [cart, setCart] = useState<number[]>([])
  const [wishlist, setWishlist] = useState<Set<number>>(new Set())
  const [inventory, setInventory] = useState<Array<{ purchaseId: string; id: number; name: string; variant?: string; cost: number; purchasedAt: string; category: ShopItem['category'] }>>([])
  const [activeTab, setActiveTab] = useState<'catalog' | 'favorites' | 'inventory'>('catalog')
  // confirm modal removed; purchases happen immediately
  const [refundingId, setRefundingId] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(id)
  }, [])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const items: ShopItem[] = [
    // Академические преимущества
    { id: 1, name: 'Приоритетная запись на курсы', cost: 18000, desc: 'Первоочередная запись на популярные факультативы и курсы по выбору', icon: '⭐', category: 'benefit', variants: ['1 курс', '2 курса', '3 курса'], popular: true, rating: 4.8, purchases: 234 },
    { id: 2, name: 'Дополнительные материалы', cost: 15000, desc: 'Доступ к расширенной библиотеке учебных материалов и записей лекций', icon: '📚', category: 'benefit', variants: ['1 предмет', '3 предмета', '5 предметов'], rating: 4.7, purchases: 456 },
    { id: 3, name: 'Менторская поддержка', cost: 25000, desc: 'Персональные консультации с преподавателем по учебным вопросам', icon: '👨‍🏫', category: 'benefit', variants: ['30 минут', '60 минут', '90 минут'], rating: 4.9, purchases: 167 },
    { id: 4, name: 'Доступ в исследовательскую лабораторию', cost: 30000, desc: 'Возможность участия в научных исследованиях и проектах', icon: '🔬', category: 'benefit', variants: ['1 день', '1 неделя', '1 месяц'], rating: 4.6, purchases: 89 },
    { id: 5, name: 'Мастер-класс от эксперта', cost: 20000, desc: 'Участие в эксклюзивном мастер-классе от приглашенного эксперта', icon: '🎯', category: 'benefit', variants: ['IT', 'Бизнес', 'Наука'], popular: true, rating: 4.8, purchases: 298 },
    { id: 6, name: 'Карьерная консультация', cost: 12000, desc: 'Персональная консультация с карьерным консультантом', icon: '💼', category: 'benefit', variants: ['30 минут', '60 минут'], rating: 4.4, purchases: 123 },

    // Университетские сервисы
    { id: 7, name: 'Кофе в кафетерии', cost: 3000, desc: 'Горячий ароматный кофе в университетском кафетерии', icon: '☕', category: 'service', variants: ['Эспрессо', 'Капучино', 'Латте', 'Американо'], rating: 4.3, purchases: 1234 },
    { id: 8, name: 'Приоритетное обслуживание', cost: 10000, desc: 'Обслуживание без очереди в административных офисах', icon: '⚡', category: 'service', variants: ['Деканат', 'Библиотека', 'Учебная часть', 'Бухгалтерия'], rating: 4.7, purchases: 345 },
    { id: 9, name: 'Печать и копирование', cost: 2000, desc: 'Бесплатная печать документов в университетской типографии', icon: '🖨️', category: 'service', variants: ['50 страниц', '100 страниц', '200 страниц'], rating: 4.2, purchases: 567 },
    { id: 10, name: 'Бронирование аудитории', cost: 12000, desc: 'Резервирование учебной аудитории для групповых занятий', icon: '🏢', category: 'service', variants: ['2 часа', '4 часа', '6 часов'], rating: 4.5, purchases: 189 },
    { id: 11, name: 'Доставка питания', cost: 5000, desc: 'Доставка здорового питания из университетского кафетерия', icon: '🍽️', category: 'service', variants: ['Завтрак', 'Обед', 'Ужин'], rating: 4.1, purchases: 234 },
    { id: 12, name: 'Парковочное место', cost: 8000, desc: 'Зарезервированное парковочное место на территории кампуса', icon: '🅿️', category: 'service', variants: ['1 день', '1 неделя', '1 месяц'], rating: 4.6, purchases: 156 },
    { id: 13, name: 'Абонемент в спортзал', cost: 15000, desc: 'Безлимитный доступ в университетский фитнес-центр', icon: '🏋️‍♂️', category: 'service', variants: ['1 месяц', '3 месяца', '6 месяцев'], popular: true, rating: 4.5, purchases: 234 },
    { id: 14, name: 'Доступ в коворкинг', cost: 10000, desc: 'Доступ в современное коворкинг-пространство для учебы', icon: '💻', category: 'service', variants: ['1 день', '1 неделя', '1 месяц'], rating: 4.4, purchases: 178 },

    // Мерч и подарки
    { id: 15, name: 'Футболка YU', cost: 6000, desc: 'Качественная футболка с университетской символикой', icon: '👕', category: 'merch', variants: ['S', 'M', 'L', 'XL', 'XXL'], rating: 4.4, purchases: 678 },
    { id: 16, name: 'Худи YU', cost: 12000, desc: 'Теплое худи с логотипом университета', icon: '🧥', category: 'merch', variants: ['S', 'M', 'L', 'XL', 'XXL'], popular: true, rating: 4.7, purchases: 445 },
    { id: 17, name: 'Кружка YU', cost: 4000, desc: 'Фирменная керамическая кружка с университетской символикой', icon: '☕', category: 'merch', variants: ['Белая', 'Синяя', 'Зеленая', 'Черная'], rating: 4.3, purchases: 789 },
    { id: 18, name: 'Рюкзак YU', cost: 15000, desc: 'Практичный студенческий рюкзак с логотипом университета', icon: '🎒', category: 'merch', variants: ['Черный', 'Синий', 'Серый'], rating: 4.6, purchases: 234 },
    { id: 19, name: 'Блокнот YU', cost: 2500, desc: 'Университетский блокнот в твердом переплете', icon: '📓', category: 'merch', variants: ['A5', 'A4', 'Карманный'], rating: 4.2, purchases: 567 },
    { id: 20, name: 'Ручка YU', cost: 1500, desc: 'Качественная ручка с гравировкой университетского логотипа', icon: '🖊️', category: 'merch', variants: ['Синяя', 'Черная', 'Серебряная'], rating: 4.0, purchases: 890 },
    { id: 21, name: 'Флешка YU', cost: 7000, desc: 'USB-накопитель с университетской символикой', icon: '💾', category: 'merch', variants: ['16GB', '32GB', '64GB'], rating: 4.3, purchases: 234 },
    { id: 22, name: 'Термос YU', cost: 8000, desc: 'Качественный термос для горячих и холодных напитков', icon: '🫖', category: 'merch', variants: ['300мл', '500мл', '750мл'], rating: 4.5, purchases: 156 },
    { id: 23, name: 'Сертификат в подарок', cost: 8000, desc: 'Подарочный сертификат для друзей и семьи', icon: '🎁', category: 'benefit', variants: ['3000 KZT', '5000 KZT', '10000 KZT'], rating: 4.8, purchases: 123 },
  ]

  // Weekly rotation mock: mark subset as limited for current week
  const rotatedItems = useMemo(() => {
    const day = new Date().getDay()
    const rotatedIds = [1, 5, 7, 13, 16, 18, 23]
    return items.map(i => ({
      ...i,
      limitedTime: i.limitedTime || rotatedIds.includes(((i.id + day) % items.length) + 1)
    }))
  }, [items])

  const filtered = useMemo(() => {
    let result = rotatedItems.filter(i => (category === 'all' || i.category === category) && (
      i.name.toLowerCase().includes(query.toLowerCase()) || i.desc.toLowerCase().includes(query.toLowerCase())
    ))

    switch (sortBy) {
      case 'price':
        result = result.sort((a, b) => a.cost - b.cost)
        break
      case 'popular':
        result = result.sort((a, b) => (b.purchases || 0) - (a.purchases || 0))
        break
      case 'newest':
        result = result.sort((a, b) => b.id - a.id)
        break
    }

    return result
  }, [rotatedItems, category, query, sortBy])

  

  const [historyFilter, setHistoryFilter] = useState<'7' | '30' | 'all'>('all')
  const filteredInventory = useMemo(() => {
    if (historyFilter === 'all') return inventory
    const days = historyFilter === '7' ? 7 : 30
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    return inventory.filter((it) => new Date(it.purchasedAt).getTime() >= cutoff)
  }, [inventory, historyFilter])

  const exportInventoryCsv = () => {
    if (inventory.length === 0) return
    const header = ['name', 'variant', 'cost', 'purchasedAt']
    const rows = inventory.map(it => [
      it.name.replace(/"/g, '""'),
      (it.variant || '').replace(/"/g, '""'),
      String(it.cost),
      new Date(it.purchasedAt).toISOString()
    ])
    const csv = [header.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'purchases.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Coupons removed per request

  const purchase = (itemId: number) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return
    
    const finalCost = item.discount ? Math.floor(item.cost * (100 - item.discount) / 100) : item.cost
    
    if (coins < finalCost) {
      showToast('Недостаточно YU-coins! 💰', 'error')
      return
    }
    setCoins(prev => prev - finalCost)
    const chosen = selectedVariants[item.id]
    const purchaseId = `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setInventory(prev => [{ purchaseId, id: item.id, name: item.name, variant: chosen, cost: finalCost, purchasedAt: new Date().toISOString(), category: item.category }, ...prev])
    showToast(`Куплено: ${item.name}${chosen ? ` (${chosen})` : ''} (-${finalCost} YU-coins)`, 'success')
    setActiveTab('inventory')
  }

  // Service status and refund window helpers
  const REFUND_WINDOW_MINUTES = 10
  const getServiceProgress = (purchasedAt: string) => {
    const elapsedMs = Date.now() - new Date(purchasedAt).getTime()
    const elapsedMin = Math.max(0, Math.floor(elapsedMs / 60000))
    // Simple staging: 0-2 pending, 2-8 in_progress, >8 completed
    let status: 'pending' | 'in_progress' | 'completed' = 'pending'
    if (elapsedMin >= 8) status = 'completed'
    else if (elapsedMin >= 2) status = 'in_progress'
    const percent = Math.min(100, Math.round((elapsedMin / 8) * 100))
    return { status, percent, elapsedMin }
  }
  const canRefund = (purchasedAt: string) => {
    const elapsedMs = Date.now() - new Date(purchasedAt).getTime()
    return elapsedMs <= REFUND_WINDOW_MINUTES * 60 * 1000
  }
  const refundPurchase = (purchaseId: string) => {
    if (refundingId) return
    setRefundingId(purchaseId)
    const entry = inventory.find(e => e.purchaseId === purchaseId)
    if (!entry) { setRefundingId(null); return }
    // Optional guard: only allow refund if still within window and pending
    if (!canRefund(entry.purchasedAt)) { setRefundingId(null); return }
    setInventory(prev => prev.filter(e => e.purchaseId !== purchaseId))
    setCoins(c => c + entry.cost)
    showToast(`Заказ отменён. Возврат ${entry.cost} YU-coins`, 'success')
    setRefundingId(null)
  }


  const categoryStats = useMemo(() => {
    const stats = {
      benefit: items.filter(i => i.category === 'benefit').length,
      service: items.filter(i => i.category === 'service').length,
      merch: items.filter(i => i.category === 'merch').length,
    }
    return stats
  }, [items])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Falling coins background */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        {Array.from({ length: 16 }).map((_, i) => {
          const size = 36 + (i % 5) * 10
          const left = `${(i * 6.25 + (i % 4) * 3) % 100}%`
          const delay = `${(i % 7) * 0.9}s`
          const duration = `${11 + (i % 6) * 1.7}s`
          return (
            <div
              key={`shop-coin-${i}`}
              className="absolute -top-24 rounded-full bg-white/60 backdrop-blur-sm shadow-md animate-[coin-fall_var(--dur)_linear_infinite]"
              style={{ left, width: `${size}px`, height: `${size}px`, animationDelay: delay as any, "--dur": duration as any } as any}
            >
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                <Image src="/YU-coin.png" alt="YU coin" width={size} height={size} className="object-contain" />
              </div>
            </div>
          )
        })}
      </div>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 relative z-10">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/YU-Gamification" className="inline-flex items-center gap-1 hover:text-gray-700 transition-colors">
            <Home className="w-4 h-4" /> Главная
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-700 font-medium">Магазин</span>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-80 xl:w-96 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-6 space-y-4 lg:space-y-6">
              <Card hover={false} className="bg-gradient-to-br from-white to-gray-50/50 border-gray-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-yellow-300/20 rounded-full -mr-16 -mt-16"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center gap-4 mb-6 pt-2">
                    <Image src="/YU-coin.png" alt="YU coin" width={28} height={28} className="w-16 h-16" />
                    <div>
                      <p className="text-sm text-gray-600">Ваш баланс</p>
                      <p className="text-3xl font-bold text-gray-800">{coins.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">YU-coins</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { key: 'benefit', label: 'Преимущества', count: categoryStats.benefit, icon: Trophy, color: 'from-blue-500 to-cyan-500' },
                      { key: 'service', label: 'Сервисы', count: categoryStats.service, icon: Zap, color: 'from-green-500 to-emerald-500' },
                      { key: 'merch', label: 'Мерч', count: categoryStats.merch, icon: Shirt, color: 'from-purple-500 to-pink-500' },
                    ].map(({ key, label, count, icon: Icon, color }: any) => (
                      <button
                        key={key}
                        onClick={() => setCategory(key)}
                        className={`group p-3 rounded-xl text-left transition-all duration-200 border ${
                          category === key
                            ? `bg-gradient-to-r ${color} text-white border-transparent shadow-lg scale-105`
                            : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4" />
                          <span className="text-xs font-semibold">{label}</span>
                        </div>
                        <div className={`text-sm font-bold ${category === key ? 'text-white/90' : 'text-gray-500'}`}>
                          {count} товаров
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCategory('all')}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      category === 'all'
                        ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Показать все ({items.length})
                  </button>
                </CardContent>
              </Card>

              <Card hover={false} className="overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" /> 
                    Специальные предложения
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-amber-200">
                        <Gift className="w-4 h-4 text-amber-700" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800 mb-1">Еженедельный бонус</p>
                        <p className="text-xs text-gray-600 leading-relaxed">Скидка 20% на премиум товары каждое воскресенье</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-green-200">
                        <Users className="w-4 h-4 text-green-700" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800 mb-1">Приведи друга</p>
                        <p className="text-xs text-gray-600 leading-relaxed">500 YU-coins за каждого приглашенного друга</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card hover={false}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" /> 
                    Популярное сегодня
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.filter(i => i.popular).slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="text-2xl">{item.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-amber-600 font-bold text-xs">
                            <Image src="/YU-coin.png" alt="YU coin" width={28} height={28} className="w-12 h-12" />
                            {item.cost.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-500">{item.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 space-y-4 lg:space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              {(['catalog','favorites','inventory'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <span className="truncate">{tab === 'catalog' ? 'Каталог' : tab === 'favorites' ? `Избранные (${wishlist.size})` : `Мои покупки (${inventory.length})`}</span>
                </button>
              ))}
            </div>
            {/* Header Banner */}
            <div className="relative overflow-hidden">
              <Card hover={false} className="border-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
                <CardContent className="relative z-10 p-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/10">
                          <ShoppingBag className="w-10 h-10 text-yellow-200" />
                        </div>
                        <div>
                          <h1 className="text-4xl font-bold mb-1">Магазин наград</h1>
                          <div className="flex items-center gap-4">
                            <p className="text-white/80">Обменивайте YU-coins на полезные награды</p>
                            <Badge variant="limited" className="animate-pulse">
                              <Clock className="w-3 h-3 mr-1" />
                              Ограниченные предложения
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="bg-white/15 rounded-2xl p-4 border border-white/20 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <Image src="/YU-coin.png" alt="YU coin" width={28} height={28} className="w-12 h-12" />
                          <span className="font-bold text-2xl">{coins.toLocaleString()}</span>
                        </div>
                        <span className="text-white/80 text-sm">YU-coins доступно</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            

            {/* Search and Filter */}
            <Card className="shadow-md">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex-1 relative">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Найти товар..."
                      className="w-full h-10 sm:h-11 px-3 sm:px-4 pl-9 sm:pl-11 pr-3 sm:pr-4 text-sm sm:text-base rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                      <Search className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 self-center lg:self-auto">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Сортировка:</span>
                      <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="h-11 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="popular">По популярности</option>
                        <option value="price">По цене</option>
                        <option value="newest">Новинки</option>
                      </select>
                    </div>
                    
                    <div className="hidden md:flex gap-2">
                      {(['all','benefit','service','merch'] as const).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            category === cat 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {cat === 'all' ? 'Все' : 
                           cat === 'benefit' ? 'Преимущества' : 
                           cat === 'service' ? 'Сервисы' : 
                           'Мерч'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  
                </div>
              </CardContent>
            </Card>

            {/* Inventory View */}
            {activeTab === 'inventory' ? (
              <div className="space-y-4">
                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {(['7','30','all'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setHistoryFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${historyFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {f === '7' ? 'За 7 дней' : f === '30' ? 'За 30 дней' : 'За всё время'}
                      </button>
                    ))}
                  </div>
                  <button onClick={exportInventoryCsv} className="text-xs text-blue-600 hover:underline">Экспорт CSV</button>
                </div>

                {filteredInventory.length === 0 ? (
                  <Card className="text-center py-10">
                    <CardContent>
                      <div className="text-5xl mb-3">👜</div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">Пока пусто</h3>
                      <p className="text-gray-500">Покупайте в каталоге — предметы появятся здесь</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredInventory.map((it) => (
                      <Card key={it.purchaseId} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-800">{it.name}</div>
                              {it.variant && <div className="text-xs text-gray-500 mt-0.5">Вариант: {it.variant}</div>}
                              <div className="text-xs text-gray-500 mt-1">Куплено: {new Date(it.purchasedAt).toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-amber-600 font-bold">
                                <Image src="/YU-coin.png" alt="YU coin" width={20} height={20} className="w-12 h-12" />
                                {it.cost.toLocaleString()}
                              </div>
                              <button className="mt-2 text-xs text-blue-600 hover:underline">Повторить покупку</button>
                            </div>
                          </div>
                          {(() => {
                            // Общая индикация статуса для всех покупок
                            const { status, percent, elapsedMin } = getServiceProgress(it.purchasedAt)
                            return (
                              <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                                  <span>Статус: {status === 'pending' ? 'В обработке' : status === 'in_progress' ? 'Выполняется' : 'Готово'}</span>
                                  <span>{percent}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div className={`h-2 ${status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }} />
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-[11px] text-gray-500">с момента покупки: {elapsedMin} мин</span>
                                  {canRefund(it.purchasedAt) && status === 'pending' && (
                                    <button
                                      onClick={() => refundPurchase(it.purchaseId)}
                                      className="text-[11px] text-red-600 hover:underline"
                                    >
                                      Отменить и вернуть
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })()}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {/* Products Grid */}
            {activeTab === 'catalog' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map(item => {
                const finalCost = item.discount ? Math.floor(item.cost * (100 - item.discount) / 100) : item.cost
                const canAfford = coins >= finalCost
                
                return (
                  <Card key={item.id} className="group hover:shadow-xl relative overflow-hidden">
                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                      {item.popular && (
                        <Badge variant="popular" className="shadow-lg">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Популярное
                        </Badge>
                      )}
                      {item.discount && (
                        <Badge variant="discount" className="shadow-lg">
                          -{item.discount}%
                        </Badge>
                      )}
                      {item.limitedTime && (
                        <Badge variant="limited" className="shadow-lg animate-pulse">
                          <Clock className="w-3 h-3 mr-1" />
                          Ограничено
                        </Badge>
                      )}
                      
                    </div>
                    {/* Wishlist */}
                    <button
                      onClick={() => setWishlist(prev => {
                        const next = new Set(prev)
                        if (next.has(item.id)) next.delete(item.id); else next.add(item.id)
                        return next
                      })}
                      className={`absolute top-10 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors ${
                        wishlist.has(item.id) ? 'bg-pink-100 text-pink-600' : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                      title="Добавить в избранное"
                    >
                      <Heart className={`w-4 h-4 ${wishlist.has(item.id) ? 'fill-current' : ''}`} />
                    </button>

                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                            {item.icon}
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-amber-600 font-bold text-xl">
                              <Image src="/YU-coin.png" alt="YU coin" width={20} height={20} className="w-12 h-12" />
                              <div className="flex flex-col items-end">
                                {item.discount ? (
                                  <>
                                    <span className="text-gray-400 line-through text-sm">{item.cost.toLocaleString()}</span>
                                    <span>{finalCost.toLocaleString()}</span>
                                  </>
                                ) : (
                                  <span>{item.cost.toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {item.name}
                          </h3>
                          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3">{item.desc}</p>
                          
                          {/* Stats */}
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                            {item.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="font-medium">{item.rating}</span>
                              </div>
                            )}
                            {item.purchases && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{item.purchases} покупок</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Variants */}
                        {item.variants && item.variants.length > 0 && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Выберите вариант:</label>
                            <select
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              value={selectedVariants[item.id] || item.variants[0]}
                              onChange={(e) => setSelectedVariants(prev => ({ ...prev, [item.id]: e.target.value }))}
                            >
                              {item.variants.map(v => (
                                <option key={v} value={v}>{v}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Purchase Button */}
                        <button
                          onClick={() => purchase(item.id)}
                          disabled={!canAfford}
                          className={`w-full py-3 rounded-xl font-bold transition-all duration-200 relative overflow-hidden ${
                            canAfford
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105 active:scale-95 hover:from-green-600 hover:to-emerald-700'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {canAfford ? (
                              <>
                                <ShoppingBag className="w-4 h-4" />
                                Купить сейчас
                              </>
                            ) : (
                              <>
                                <Image src="/YU-coin.png" alt="YU coin" width={16} height={16} className="w-12 h-12" />
                                Недостаточно YU-coins
                              </>
                            )}
                          </div>
                          {canAfford && (
                            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          )}
                        </button>
                        {/* Favorites quick link in card footer */}
                        {wishlist.size > 0 && (
                          <button
                            onClick={() => setActiveTab('favorites')}
                            className="w-full mt-2 text-xs text-blue-600 hover:underline"
                          >
                            Перейти к избранным
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            )}

            {/* Favorites View */}
            {activeTab === 'favorites' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {items.filter(i => wishlist.has(i.id)).map(item => {
                  const finalCost = item.discount ? Math.floor(item.cost * (100 - item.discount) / 100) : item.cost
                  const canAfford = coins >= finalCost
                  return (
                    <Card key={`fav-${item.id}`} className="group relative overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="text-5xl">{item.icon}</div>
                          <button
                            onClick={() => setWishlist(prev => { const next = new Set(prev); next.delete(item.id); return next })}
                            className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mt-2"
                            title="Убрать из избранного"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mt-4">{item.name}</h3>
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.desc}</p>
                        <div className="flex items-center gap-1 text-amber-600 font-bold text-lg mt-3">
                          <Image src="/YU-coin.png" alt="YU coin" width={28} height={28} className="w-12 h-12" />
                          {finalCost.toLocaleString()}
                        </div>
                        <button
                          onClick={() => purchase(item.id)}
                          disabled={!canAfford}
                          className={`w-full mt-3 py-3 rounded-xl font-bold transition-all duration-200 ${
                            canAfford ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          Купить
                        </button>
                      </CardContent>
                    </Card>
                  )
                })}
                {items.filter(i => wishlist.has(i.id)).length === 0 && (
                  <Card className="text-center py-10">
                    <CardContent>
                      <div className="text-5xl mb-3">🤍</div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">В избранном пусто</h3>
                      <p className="text-gray-500">Нажимайте на сердечко в карточке товара, чтобы добавить</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : null}

            {/* Empty State */}
            {filtered.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Ничего не найдено</h3>
                  <p className="text-gray-500 mb-6">Попробуйте изменить критерии поиска или выберите другую категорию</p>
                  <button 
                    onClick={() => { setQuery(''); setCategory('all'); }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Сбросить фильтры
                  </button>
                </CardContent>
              </Card>
            )}

            
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes coin-fall {
          0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          99% { opacity: 1; }
          100% { transform: translateY(calc(200vh + 320px)) rotate(360deg); opacity: 0; }
        }
        
        /* Mobile optimizations */
        .touch-manipulation {
          touch-action: manipulation;
        }
        
        /* Improve scrolling on mobile */
        @media (max-width: 1023px) {
          body {
            -webkit-overflow-scrolling: touch;
          }
          
          /* Hide scrollbars on mobile for cleaner look */
          ::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-20 lg:bottom-6 right-3 lg:right-6 left-3 lg:left-auto z-50 px-4 lg:px-6 py-3 lg:py-4 rounded-2xl shadow-2xl text-white font-semibold lg:min-w-[350px] max-w-[calc(100vw-1.5rem)] lg:max-w-none transform transition-all duration-300 ${
          toast.type === 'error' 
            ? 'bg-gradient-to-r from-red-500 to-pink-600' 
            : 'bg-gradient-to-r from-green-500 to-emerald-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/20`}>
              <span className="text-xl">{toast.type === 'error' ? '⚠️' : '🎉'}</span>
            </div>
            <div className="flex-1">
              <span className="block">{toast.message}</span>
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

      {/* Floating Action Button for Mobile Categories */}
      <div className="fixed bottom-20 left-3 lg:hidden z-40">
        <div className="flex flex-col gap-2">
          {(['all','benefit','service','merch'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`w-12 h-12 rounded-full shadow-lg transition-all duration-200 touch-manipulation ${
                category === cat 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-110' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title={cat === 'all' ? 'Все' : 
                     cat === 'benefit' ? 'Преимущества' : 
                     cat === 'service' ? 'Сервисы' : 
                     'Мерч'}
            >
              {cat === 'all' ? '📋' :
               cat === 'benefit' ? '🏆' :
               cat === 'service' ? '⚡' :
               '👕'}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {[
            { href: '/YU-Gamification', icon: Home, label: 'Главная' },
            { href: '/YU-Gamification?tab=quests', icon: Target, label: 'Квесты' },
            { href: '/YU-Gamification/shop', icon: ShoppingBag, label: 'Магазин', active: true },
            { href: '/YU-Gamification?tab=leaderboard', icon: Trophy, label: 'Рейтинг' },
            { href: '/YU-Gamification?tab=profile', icon: Users, label: 'Профиль' }
          ].map(({ href, icon: Icon, label, active = false }) => (
            <a
              key={href}
              href={href}
              className={`flex flex-col items-center py-2 px-1 text-xs rounded-lg transition-colors min-h-[60px] touch-manipulation ${
                active 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-5 h-5 mb-1 flex-shrink-0" />
              <span className="truncate max-w-full leading-tight">{label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Back to Top Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-20 lg:bottom-6 right-3 lg:right-6 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-30"
      >
        ↑
      </button>
    </div>
  )
}