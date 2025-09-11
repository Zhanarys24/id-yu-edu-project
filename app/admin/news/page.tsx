'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import { useAuth } from '@/context/AuthContext'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Archive, 
  Calendar,
  BarChart3,
  FolderOpen,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  FileText,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { newsService } from '@/lib/services/newsService'
import { NewsItem, NewsCategory, NewsStatus, NewsAnalytics } from '@/lib/types/news'
import { exportNewsClicksToExcel } from '@/lib/utils/excelExport'
import { formatDate } from '@/lib/utils/dateUtils'
import SimpleNewsForm from './components/SimpleNewsForm'

export default function AdminNewsPage() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation('common')
  const router = useRouter()
  const [locale, setLocale] = useState('ru')
  const [news, setNews] = useState<NewsItem[]>([])
  const [categories, setCategories] = useState<NewsCategory[]>([])
  const [analytics, setAnalytics] = useState<NewsAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<NewsStatus | 'all'>('all')
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'archived'>('all')
  
  // Инициализация языка
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale')
    const initial = savedLocale || i18n.language || 'ru'
    setLocale(initial)
    if (i18n.language !== initial) {
      i18n.changeLanguage(initial)
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = initial
    }
  }, [i18n])

  const loadData = () => {
    try {
      const allNews = newsService.getAllNews()
      const allCategories = newsService.getAllCategories()
      const analyticsData = newsService.getAnalytics()

      setNews(allNews)
      setCategories(allCategories)
      setAnalytics(analyticsData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading news data:', error)
      setLoading(false)
    }
  }

  // Load data
  useEffect(() => {
    loadData()
  }, [])
  
  // Check permissions AFTER all hooks and only on client
  useEffect(() => {
    if (!user || (user.role !== 'admin_news' && user.role !== 'super_admin')) {
      router.push('/login')
    }
  }, [user, router])

  if (!user || (user.role !== 'admin_news' && user.role !== 'super_admin')) {
    return null
  }

  // Функция смены языка
  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLocale = e.target.value
    setLocale(selectedLocale)
    localStorage.setItem('locale', selectedLocale)
    i18n.changeLanguage(selectedLocale)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = selectedLocale
    }
  }


  // Filter news based on active tab
  const getFilteredNews = () => {
    let filteredNews = news

    if (activeTab === 'archived') {
      filteredNews = news.filter(item => item.status === 'archived')
    } else {
      filteredNews = news.filter(item => item.status !== 'archived')
    }

    return filteredNews.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || 
        (selectedCategory === 'no-category' ? !item.categoryId : item.categoryId === selectedCategory)
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }

  const filteredNews = getFilteredNews()

  // News actions

  const handleArchive = (id: string) => {
    try {
      newsService.archiveNews(id)
      loadData()
    } catch (error) {
      console.error('Error archiving news:', error)
      alert('Ошибка при архивировании новости')
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту новость?')) {
      try {
        newsService.deleteNews(id)
        loadData()
      } catch (error) {
        console.error('Error deleting news:', error)
        alert('Ошибка при удалении новости')
      }
    }
  }

  const handleExportToExcel = () => {
    try {
      const clicksData = newsService.getAllClicks()
      if (clicksData.length === 0) {
        alert('Нет данных о переходах для экспорта')
        return
      }
      exportNewsClicksToExcel(clicksData)
    } catch (error) {
      console.error('Ошибка экспорта в Excel:', error)
      alert('Ошибка при экспорте данных')
    }
  }


  const getStatusIcon = (status: NewsStatus) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'archived':
        return <Archive className="w-4 h-4 text-gray-500" />
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusText = (status: NewsStatus) => {
    switch (status) {
      case 'published':
        return t('admin.news.published')
      case 'archived':
        return t('admin.news.archived')
      case 'scheduled':
        return t('admin.news.scheduled')
      default:
        return 'Неизвестно'
    }
  }

  const getStatusColor = (status: NewsStatus) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
                className="group p-3 hover:bg-white/80 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
                <ArrowLeft size={20} className="text-gray-600 group-hover:text-gray-900 transition-colors" />
            </button>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <FileText size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {t('admin.news.title')}
            </h1>
                  <p className="text-gray-600 mt-2 text-lg">
                    {t('admin.news.description')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Селектор языка */}
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-gray-500" />
                <select
                  value={locale}
                  onChange={changeLanguage}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white/80"
                >
                  <option value="ru">🇷🇺 Русский</option>
                  <option value="en">🇺🇸 English</option>
                  <option value="kz">🇰🇿 Қазақша</option>
                </select>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="flex items-center gap-2 bg-white/80 hover:bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <BarChart3 size={16} />
                {showAnalytics ? t('admin.news.analytics') : t('admin.news.analytics')}
              </Button>
              <Button
                variant="outline"
                onClick={handleExportToExcel}
                className="flex items-center gap-2 bg-white/80 hover:bg-white border-green-200 hover:border-green-300 text-green-700 hover:text-green-900 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Download size={16} />
                {t('admin.news.export')}
              </Button>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus size={16} />
                {t('admin.news.addNews')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics */}
        {showAnalytics && analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('admin.news.analytics.totalNews')}</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalNews}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('admin.news.analytics.published')}</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.publishedNews}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('admin.news.analytics.scheduled')}</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.scheduledNews || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Archive className="w-6 h-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('admin.news.analytics.archived')}</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.archivedNews}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('news.pageTitle')}
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'archived'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('admin.news.archived')}
          </button>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.news.search')}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t('admin.news.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.news.category')}</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('admin.news.allCategories')}</option>
                <option value="no-category">{t('admin.news.noCategory')}</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.news.status')}</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as NewsStatus | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('admin.news.allStatuses')}</option>
                <option value="published">{t('admin.news.published')}</option>
                <option value="archived">{t('admin.news.archived')}</option>
                <option value="scheduled">{t('admin.news.scheduled')}</option>
              </select>
            </div>
          </div>
        </Card>

        {/* News List */}
        <div className="space-y-4">
          {filteredNews.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-medium">{t('admin.news.noNews')}</p>
                <p className="text-sm">{t('admin.news.noNewsDescription')}</p>
              </div>
            </Card>
          ) : (
            filteredNews.map((item) => (
              <Card key={item.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(item.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                      {item.isFeatured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          {t('news.featured')}
                        </span>
                      )}
                      {item.isBreaking && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          {t('news.breaking')}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {item.category && (
                        <div className="flex items-center gap-1">
                          <FolderOpen className="w-4 h-4" />
                          <span>{item.category.name}</span>
                        </div>
                      )}
                      {item.link && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span className="text-blue-600">{t('admin.news.hasLink')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{item.viewCount} {t('admin.news.views')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingNews(item)}
                      title={t('admin.news.edit')}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    
                    {item.status === 'published' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchive(item.id)}
                        className="text-gray-600 hover:text-gray-700"
                        title={t('admin.news.archive')}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-700"
                      title={t('admin.news.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Simple News Form Modal */}
      {(showCreateForm || editingNews) && (
        <SimpleNewsForm
          news={editingNews}
          onClose={() => {
            setShowCreateForm(false)
            setEditingNews(null)
          }}
          onSave={() => {
            loadData()
            setShowCreateForm(false)
            setEditingNews(null)
          }}
        />
      )}
    </div>
  )
}