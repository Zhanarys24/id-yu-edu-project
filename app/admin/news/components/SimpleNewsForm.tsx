'use client'

import { useState, useEffect } from 'react'
import { X, Save, Calendar, Tag, Image, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { newsService } from '@/lib/services/newsService'
import { NewsItem, NewsCategory, NewsStatus } from '@/lib/types/news'

interface SimpleNewsFormProps {
  news?: NewsItem | null
  onClose: () => void
  onSave: () => void
}

export default function SimpleNewsForm({ news, onClose, onSave }: SimpleNewsFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    titleKz: '',
    description: '',
    descriptionEn: '',
    descriptionKz: '',
    image: '',
    link: '',
    categoryId: '',
    status: 'published' as NewsStatus,
    publishedAt: '',
    scheduledAt: ''
  })

  const [categories, setCategories] = useState<NewsCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'ru' | 'en' | 'kz'>('ru')

  useEffect(() => {
    loadData()
    if (news) {
      setFormData({
        title: news.title,
        titleEn: news.titleEn,
        titleKz: news.titleKz,
        description: news.description,
        descriptionEn: news.descriptionEn,
        descriptionKz: news.descriptionKz,
        image: news.image,
        link: news.link || '',
        categoryId: news.categoryId,
        status: news.status,
        publishedAt: news.publishedAt || '',
        scheduledAt: news.scheduledAt || ''
      })
    }
  }, [news])

  const loadData = () => {
    const categoriesData = newsService.getAllCategories()
    setCategories(categoriesData)
  }

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    // Автоматически исправляем путь к изображению, если он не начинается с /
    if (field === 'image' && value && !value.startsWith('/') && !value.startsWith('http')) {
      value = `/${value}`
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const now = new Date().toISOString()
      const newsData = {
        ...formData,
        content: formData.description || formData.title, // Используем описание как контент, если нет - то заголовок
        contentEn: formData.descriptionEn || formData.titleEn,
        contentKz: formData.descriptionKz || formData.titleKz,
        excerpt: formData.description || formData.title,
        excerptEn: formData.descriptionEn || formData.titleEn,
        excerptKz: formData.descriptionKz || formData.titleKz,
        imageAlt: '',
        tags: [],
        authorId: '1',
        authorName: 'Администратор',
        authorEmail: 'admin@yu.edu.kz',
        viewCount: 0,
        isFeatured: false,
        isBreaking: false,
        seoTitle: '',
        seoDescription: '',
        seoKeywords: [],
        createdAt: news ? news.createdAt : now,
        updatedAt: now,
        publishedAt: formData.status === 'published' ? (formData.publishedAt || now) : undefined,
        scheduledAt: formData.status === 'scheduled' ? formData.scheduledAt : undefined
      }

      if (news) {
        newsService.updateNews(news.id, newsData)
      } else {
        newsService.createNews(newsData)
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving news:', error)
      alert('Ошибка при сохранении новости')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'ru', label: 'Русский', flag: '🇷🇺' },
    { id: 'en', label: 'English', flag: '🇺🇸' },
    { id: 'kz', label: 'Қазақша', flag: '🇰🇿' }
  ] as const

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {news ? 'Редактировать новость' : 'Добавить новость'}
            </h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Language Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.flag} {tab.label}
                </button>
              ))}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заголовок ({tabs.find(t => t.id === activeTab)?.label})
              </label>
              <Input
                value={formData[`title${activeTab === 'ru' ? '' : activeTab === 'en' ? 'En' : 'Kz'}` as keyof typeof formData] as string}
                onChange={(e) => handleInputChange(`title${activeTab === 'ru' ? '' : activeTab === 'en' ? 'En' : 'Kz'}`, e.target.value)}
                placeholder="Введите заголовок новости"
                required
              />
            </div>

            {/* Description */}
                          <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Краткое описание ({tabs.find(t => t.id === activeTab)?.label}) (необязательно)
                </label>
                <textarea
                  value={formData[`description${activeTab === 'ru' ? '' : activeTab === 'en' ? 'En' : 'Kz'}` as keyof typeof formData] as string}
                  onChange={(e) => handleInputChange(`description${activeTab === 'ru' ? '' : activeTab === 'en' ? 'En' : 'Kz'}`, e.target.value)}
                  placeholder="Краткое описание новости"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Image className="w-4 h-4 inline mr-1" />
                Изображение
              </label>
              <Input
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="URL изображения"
                required
              />
            </div>

            {/* Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Link className="w-4 h-4 inline mr-1" />
                Ссылка (необязательно)
              </label>
              <Input
                value={formData.link}
                onChange={(e) => handleInputChange('link', e.target.value)}
                placeholder="https://example.com"
                type="url"
              />
              <p className="text-xs text-gray-500 mt-1">
                Если указана ссылка, кнопка &quot;Читать дальше&quot; будет вести на эту ссылку
              </p>
            </div>

            {/* Date and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Дата публикации
                </label>
                <Input
                  type="date"
                  value={formData.publishedAt ? formData.publishedAt.split('T')[0] : ''}
                  onChange={(e) => handleInputChange('publishedAt', e.target.value ? `${e.target.value}T00:00:00` : '')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Статус
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="published">Опубликовать сейчас</option>
                  <option value="scheduled">Запланировать</option>
                  <option value="archived">Архив</option>
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Категория (необязательно)
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Без категории</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Scheduled Date (only for scheduled status) */}
            {formData.status === 'scheduled' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Запланировать на
                </label>
                <Input
                  type="date"
                  value={formData.scheduledAt ? formData.scheduledAt.split('T')[0] : ''}
                  onChange={(e) => handleInputChange('scheduledAt', e.target.value ? `${e.target.value}T00:00:00` : '')}
                  required
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {news ? 'Сохранить изменения' : 'Добавить новость'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
