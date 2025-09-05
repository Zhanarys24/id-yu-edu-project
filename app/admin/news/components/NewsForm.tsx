'use client'

import { useState, useEffect } from 'react'
import { X, Save, Eye, Calendar, Tag, Image, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { newsService } from '@/lib/services/newsService'
import { NewsItem, NewsCategory, NewsTag, NewsStatus } from '@/lib/types/news'

interface NewsFormProps {
  news?: NewsItem | null
  onClose: () => void
  onSave: () => void
}

export default function NewsForm({ news, onClose, onSave }: NewsFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    titleKz: '',
    description: '',
    descriptionEn: '',
    descriptionKz: '',
    content: '',
    contentEn: '',
    contentKz: '',
    excerpt: '',
    excerptEn: '',
    excerptKz: '',
    image: '',
    imageAlt: '',
    link: '',
    categoryId: '',
    tags: [] as string[],
    status: 'draft' as NewsStatus,
    isFeatured: false,
    isBreaking: false,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: [] as string[],
    scheduledAt: ''
  })

  const [categories, setCategories] = useState<NewsCategory[]>([])
  const [allTags, setAllTags] = useState<NewsTag[]>([])
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
        content: news.content,
        contentEn: news.contentEn,
        contentKz: news.contentKz,
        excerpt: news.excerpt,
        excerptEn: news.excerptEn,
        excerptKz: news.excerptKz,
        image: news.image,
        imageAlt: news.imageAlt || '',
        link: news.link || '',
        categoryId: news.categoryId,
        tags: news.tags,
        status: news.status,
        isFeatured: news.isFeatured,
        isBreaking: news.isBreaking,
        seoTitle: news.seoTitle || '',
        seoDescription: news.seoDescription || '',
        seoKeywords: news.seoKeywords || [],
        scheduledAt: news.scheduledAt || ''
      })
    }
  }, [news])

  const loadData = () => {
    const categoriesData = newsService.getAllCategories()
    const tagsData = newsService.getAllTags()
    setCategories(categoriesData)
    setAllTags(tagsData)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTagToggle = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }))
  }

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0)
    setFormData(prev => ({
      ...prev,
      seoKeywords: keywords
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newsData = {
        ...formData,
        authorId: '1', // В реальном приложении брать из контекста
        authorName: 'Администратор',
        authorEmail: 'admin@yu.edu.kz'
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {news ? 'Редактировать новость' : 'Создать новость'}
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
                Описание ({tabs.find(t => t.id === activeTab)?.label})
              </label>
              <textarea
                value={formData[`description${activeTab === 'ru' ? '' : activeTab === 'en' ? 'En' : 'Kz'}` as keyof typeof formData] as string}
                onChange={(e) => handleInputChange(`description${activeTab === 'ru' ? '' : activeTab === 'en' ? 'En' : 'Kz'}`, e.target.value)}
                placeholder="Краткое описание новости"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Содержание ({tabs.find(t => t.id === activeTab)?.label})
              </label>
              <textarea
                value={formData[`content${activeTab === 'ru' ? '' : activeTab === 'en' ? 'En' : 'Kz'}` as keyof typeof formData] as string}
                onChange={(e) => handleInputChange(`content${activeTab === 'ru' ? '' : activeTab === 'en' ? 'En' : 'Kz'}`, e.target.value)}
                placeholder="Полное содержание новости"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={8}
                required
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Краткое содержание ({tabs.find(t => t.id === activeTab)?.label})
              </label>
              <textarea
                value={formData[`excerpt${activeTab === 'ru' ? '' : activeTab === 'en' ? 'En' : 'Kz'}` as keyof typeof formData] as string}
                onChange={(e) => handleInputChange(`excerpt${activeTab === 'ru' ? '' : activeTab === 'en' ? 'En' : 'Kz'}`, e.target.value)}
                placeholder="Краткое содержание для превью"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
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
              <Input
                value={formData.imageAlt}
                onChange={(e) => handleInputChange('imageAlt', e.target.value)}
                placeholder="Альтернативный текст для изображения"
                className="mt-2"
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

            {/* Category and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Категория
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Теги
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {allTags.map(tag => (
                    <label key={tag.id} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.tags.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span style={{ color: tag.color }}>{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Status and Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Черновик</option>
                  <option value="published">Опубликовано</option>
                  <option value="scheduled">Запланировано</option>
                  <option value="archived">Архив</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Запланировать на
                </label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                  disabled={formData.status !== 'scheduled'}
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Рекомендуемое</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isBreaking}
                  onChange={(e) => handleInputChange('isBreaking', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Срочное</span>
              </label>
            </div>

            {/* SEO */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">SEO настройки</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO заголовок
                  </label>
                  <Input
                    value={formData.seoTitle}
                    onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                    placeholder="SEO заголовок (если отличается от основного)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO описание
                  </label>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                    placeholder="SEO описание для поисковых систем"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ключевые слова (через запятую)
                  </label>
                  <Input
                    value={formData.seoKeywords.join(', ')}
                    onChange={(e) => handleKeywordsChange(e.target.value)}
                    placeholder="ключевое слово 1, ключевое слово 2, ..."
                  />
                </div>
              </div>
            </div>

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
                {news ? 'Сохранить изменения' : 'Создать новость'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}

