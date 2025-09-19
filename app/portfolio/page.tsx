'use client'

import { Suspense, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import { useSearchParams, useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { useAuth } from '@/context/AuthContext'
import { portfolioService } from '@/lib/services/portfolioService'
import { GeneralInfo, Publication, TeachingActivity, Achievement, AdditionalActivity, PortfolioFile } from '@/lib/types/portfolio'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Edit3, Plus, Trash2, Save, X, BookOpen, Award, Briefcase, Activity, FileText, Image, File, Download, FileDown } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import clsx from 'clsx'
import { exportPortfolioToWord } from '@/lib/utils/wordExport'
import { publicationsService, PublicationByYear, PublicationStats } from '@/lib/services/publicationsService'

function PortfolioContent() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()

  const defaultTab = searchParams.get('tab') || 'general'
  const [activeTab, setActiveTab] = useState(defaultTab)

  const sections = [
    { label: t('portfolio.general'), key: 'general' },
    { label: t('portfolio.publications'), key: 'publications' },
    { label: t('portfolio.teaching'), key: 'teaching' },
    { label: t('portfolio.achievements'), key: 'achievements' },
    { label: t('portfolio.additional'), key: 'additional' },
  ]

  useEffect(() => {
    const current = searchParams.get('tab')
    if (current && current !== activeTab) {
      setActiveTab(current)
    }
  }, [searchParams])

  const handleTabChange = (key: string) => {
    setActiveTab(key)
    router.push(`/portfolio?tab=${key}`)
  }

  const handleExportPortfolio = () => {
    if (!user) return;

    // Получаем все записи портфолио пользователя
    const userPortfolio = portfolioService.getUserPortfolio(user.id);
    
    // Создаем объект пользователя для экспорта
    const userForExport = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: true,
      registeredAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      passwordHash: '',
      isTemporaryPassword: false
    };

    // Экспортируем в Word документ
    exportPortfolioToWord(userForExport, userPortfolio);
  }

  return (
    <Layout active={t('groups.portfolio')}>
      <div className="space-y-6">
        {/* Навигация по портфолио */}
        <div className="flex flex-wrap gap-2 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex flex-wrap gap-2 flex-1">
            {sections.map((section) => {
              const isActive = activeTab === section.key
              return (
                <button
                  key={section.key}
                  onClick={() => handleTabChange(section.key)}
                  className={clsx(
                    'relative group px-4 py-2 text-sm font-medium transition-colors duration-300',
                    isActive ? 'text-blue-700 font-semibold' : 'text-gray-700 hover:text-blue-600'
                  )}
                >
                  {section.label}
                  {/* Анимационная линия снизу */}
                  <span
                    className={clsx(
                      'absolute left-1/2 bottom-0 h-[2px] bg-blue-600 transition-all duration-300',
                      isActive
                        ? 'w-full -translate-x-1/2'
                        : 'w-0 -translate-x-1/2 group-hover:w-full'
                    )}
                  />
                </button>
              )
            })}
          </div>
          <div className="flex items-center">
            <Button
              onClick={handleExportPortfolio}
              className="flex items-center gap-2"
              variant="outline"
            >
              <FileDown size={16} />
              Экспорт в Word
            </Button>
          </div>
        </div>

        {/* Контент секции */}
        <div className="bg-white p-6 rounded-xl shadow-sm min-h-[300px]">
          {activeTab === 'general' && <GeneralSection />}
          {activeTab === 'publications' && <PublicationsSection />}
          {activeTab === 'teaching' && <TeachingSection />}
          {activeTab === 'achievements' && <AchievementsSection />}
          {activeTab === 'additional' && <AdditionalSection />}
        </div>
      </div>
    </Layout>
  )
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PortfolioContent />
    </Suspense>
  )
}

// ---- Секции ----

function GeneralSection() {
  const { user } = useAuth()
  const [generalInfo, setGeneralInfo] = useState<GeneralInfo | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    position: '',
    department: '',
    education: '',
    experience: '',
    skills: [''],
    languages: [''],
    contactInfo: {
      email: '',
      phone: '',
      address: ''
    }
  })

  useEffect(() => {
    if (user) {
      const info = portfolioService.getUserGeneralInfo(user.id)
      if (info) {
        setGeneralInfo(info)
        setFormData({
          fullName: info.fullName || user.name || '',
          position: info.position || user.position || '',
          department: info.department || '',
          education: info.education || '',
          experience: info.experience || '',
          skills: info.skills.length > 0 ? info.skills : [''],
          languages: info.languages.length > 0 ? info.languages : [''],
          contactInfo: {
            email: info.contactInfo.email || user.email || '',
            phone: info.contactInfo.phone || '',
            address: info.contactInfo.address || ''
          }
        })
      } else {
        // Если нет сохраненной информации, используем данные пользователя
        setFormData({
          fullName: user.name || '',
          position: user.position || '',
          department: '',
          education: '',
          experience: '',
          skills: [''],
          languages: [''],
          contactInfo: {
            email: user.email || '',
            phone: '',
            address: ''
          }
        })
      }
    }
  }, [user])

  const handleSave = () => {
    if (!user) return

    const savedInfo = portfolioService.saveGeneralInfo(user.id, {
      ...formData,
      title: 'Общая информация'
    })
    setGeneralInfo(savedInfo)
    setIsEditing(false)
  }

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }))
  }

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  const updateSkill = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => i === index ? value : skill)
    }))
  }

  const addLanguage = () => {
    setFormData(prev => ({
      ...prev,
      languages: [...prev.languages, '']
    }))
  }

  const removeLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }))
  }

  const updateLanguage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.map((lang, i) => i === index ? value : lang)
    }))
  }

  if (!user) {
    return <div className="text-center text-gray-500">Пользователь не авторизован</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Общая информация</h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
            <Edit3 size={16} />
            {generalInfo ? 'Редактировать' : 'Создать'}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save size={16} />
              Сохранить
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} className="flex items-center gap-2">
              <X size={16} />
              Отмена
            </Button>
          </div>
        )}
      </div>

      {!isEditing && generalInfo ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">ФИО</h3>
              <p className="text-gray-600">{generalInfo.fullName}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Должность</h3>
              <p className="text-gray-600">{generalInfo.position}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Кафедра</h3>
              <p className="text-gray-600">{generalInfo.department}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Образование</h3>
              <p className="text-gray-600">{generalInfo.education}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Опыт работы</h3>
              <p className="text-gray-600">{generalInfo.experience}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Навыки</h3>
              <div className="flex flex-wrap gap-2">
                {generalInfo.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Языки</h3>
              <div className="flex flex-wrap gap-2">
                {generalInfo.languages.map((lang, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Контакты</h3>
              <p className="text-gray-600">{generalInfo.contactInfo.email}</p>
              {generalInfo.contactInfo.phone && (
                <p className="text-gray-600">{generalInfo.contactInfo.phone}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ФИО</label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Введите полное имя"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Должность</label>
              <Input
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="Введите должность"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Кафедра</label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="Введите название кафедры"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Образование</label>
              <Input
                value={formData.education}
                onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                placeholder="Введите образование"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Опыт работы</label>
            <textarea
              value={formData.experience}
              onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
              placeholder="Опишите ваш опыт работы"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Навыки</label>
              <Button type="button" onClick={addSkill} variant="outline" className="px-3 py-1 text-sm">
                <Plus size={16} />
              </Button>
            </div>
            <div className="space-y-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                    placeholder="Введите навык"
                  />
                  {formData.skills.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeSkill(index)}
                      variant="outline"
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Языки</label>
              <Button type="button" onClick={addLanguage} variant="outline" className="px-3 py-1 text-sm">
                <Plus size={16} />
              </Button>
            </div>
            <div className="space-y-2">
              {formData.languages.map((lang, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={lang}
                    onChange={(e) => updateLanguage(index, e.target.value)}
                    placeholder="Введите язык"
                  />
                  {formData.languages.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeLanguage(index)}
                      variant="outline"
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                value={formData.contactInfo.email}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  contactInfo: { ...prev.contactInfo, email: e.target.value }
                }))}
                placeholder="Введите email"
                type="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
              <Input
                value={formData.contactInfo.phone}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  contactInfo: { ...prev.contactInfo, phone: e.target.value }
                }))}
                placeholder="Введите телефон"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Адрес</label>
              <Input
                value={formData.contactInfo.address}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  contactInfo: { ...prev.contactInfo, address: e.target.value }
                }))}
                placeholder="Введите адрес"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PublicationsSection() {
  const { user } = useAuth()
  const [publicationsByYear, setPublicationsByYear] = useState<PublicationByYear[]>([])
  const [stats, setStats] = useState<PublicationStats | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadPublications()
    }
  }, [user])

  const loadPublications = () => {
    if (!user) return
    
    setLoading(true)
    
    try {
      const publications = publicationsService.getUserPublicationsByYear(user.id)
      const publicationStats = publicationsService.getPublicationsStats(user.id)
      
      setPublicationsByYear(publications)
      setStats(publicationStats)
      
      // Автоматически выбираем год с наибольшим количеством публикаций
      const yearWithMostPublications = publications.reduce((max, current) => 
        current.count > max.count ? current : max
      )
      setSelectedYear(yearWithMostPublications.year)
    } catch (error) {
      console.error('Error loading publications:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div className="text-center text-gray-500">Пользователь не авторизован</div>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка публикаций...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Публикации и научная деятельность</h2>
          <p className="text-sm text-gray-600 mt-1">
            Научные публикации за последние 10 лет
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={loadPublications}
            variant="outline"
            className="flex items-center gap-2"
          >
            <BookOpen size={16} />
            Обновить
          </Button>
        </div>
      </div>

      {/* Общая статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl text-center border border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-800 font-medium">Всего публикаций</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl text-center border border-green-200">
            <div className="text-3xl font-bold text-green-600">{stats.journals}</div>
            <div className="text-sm text-green-800 font-medium">Журналов</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl text-center border border-purple-200">
            <div className="text-3xl font-bold text-purple-600">{stats.withDOI}</div>
            <div className="text-sm text-purple-800 font-medium">С DOI</div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl text-center border border-orange-200">
            <div className="text-3xl font-bold text-orange-600">{stats.recentYear}</div>
            <div className="text-sm text-orange-800 font-medium">В этом году</div>
          </div>
        </div>
      )}

      {/* Навигация по годам */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Публикации по годам</h3>
        <div className="grid grid-cols-5 lg:grid-cols-10 gap-2">
          {publicationsByYear.map((yearData) => (
            <button
              key={yearData.year}
              onClick={() => setSelectedYear(yearData.year)}
              className={clsx(
                'relative p-3 rounded-lg text-center transition-all duration-200 hover:scale-105',
                selectedYear === yearData.year
                  ? 'bg-blue-500 text-white shadow-lg'
                  : yearData.count > 0
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400'
              )}
            >
              <div className="text-sm font-medium">{yearData.year}</div>
              <div className={clsx(
                'text-lg font-bold mt-1',
                selectedYear === yearData.year ? 'text-white' : 'text-gray-600'
              )}>
                {yearData.count}
              </div>
              {yearData.count > 0 && (
                <div className={clsx(
                  'absolute -top-1 -right-1 w-3 h-3 rounded-full',
                  selectedYear === yearData.year ? 'bg-white' : 'bg-blue-500'
                )} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Детали выбранного года */}
      {selectedYear && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Публикации {selectedYear} года
            </h3>
            <div className="text-sm text-gray-600">
              {publicationsByYear.find(y => y.year === selectedYear)?.count || 0} публикаций
            </div>
          </div>

          {(() => {
            const yearPublications = publicationsByYear.find(y => y.year === selectedYear)?.publications || [];
            
            if (yearPublications.length === 0) {
              return (
                <div className="text-center py-12">
                  <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Публикаций не найдено</h4>
                  <p className="text-gray-600">
                    В {selectedYear} году публикаций не было
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {yearPublications.map((pub, index) => (
                  <div key={pub.id} className="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-medium">
                            #{index + 1}
                          </div>
                          <div className="text-sm text-gray-500">
                            {pub.date}
                          </div>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-3 text-lg leading-tight">
                          {pub.title}
                        </h4>
                        
                        {pub.description && (
                          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                            {pub.description}
                          </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <span className="font-medium text-gray-800">Авторы:</span> 
                            <span className="ml-1">{pub.authors.join(', ')}</span>
                          </div>
                          
                          {pub.journal && (
                            <div>
                              <span className="font-medium text-gray-800">Журнал:</span> 
                              <span className="ml-1">{pub.journal}</span>
                            </div>
                          )}
                          
                          {pub.doi && (
                            <div>
                              <span className="font-medium text-gray-800">DOI:</span> 
                              <span className="ml-1 font-mono text-xs">{pub.doi}</span>
                            </div>
                          )}
                          
                          {pub.impactFactor && (
                            <div>
                              <span className="font-medium text-gray-800">Импакт-фактор:</span> 
                              <span className="ml-1 font-semibold text-blue-600">{pub.impactFactor}</span>
                            </div>
                          )}
                          
                          {pub.citations && (
                            <div>
                              <span className="font-medium text-gray-800">Цитирования:</span> 
                              <span className="ml-1 font-semibold text-green-600">{pub.citations}</span>
                            </div>
                          )}
                        </div>

                        {pub.url && (
                          <a 
                            href={pub.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            <BookOpen size={14} />
                            Открыть публикацию
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* График активности */}
      {stats && stats.total > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">График активности</h3>
          <div className="grid grid-cols-10 gap-2">
            {publicationsByYear.map((yearData) => (
              <div key={yearData.year} className="text-center">
                <div className="text-xs text-gray-600 mb-2">{yearData.year}</div>
                <div className="bg-gray-100 rounded-lg h-24 flex items-end justify-center">
                  <div 
                    className={clsx(
                      'w-full rounded-lg transition-all duration-300',
                      yearData.count > 0 
                        ? 'bg-gradient-to-t from-blue-500 to-blue-400' 
                        : 'bg-gray-200'
                    )}
                    style={{ 
                      height: yearData.count > 0 
                        ? `${Math.max(20, (yearData.count / Math.max(...publicationsByYear.map(y => y.count))) * 80)}px`
                        : '20px'
                    }}
                  >
                    {yearData.count > 0 && (
                      <div className="text-white text-xs font-bold flex items-center justify-center h-full">
                        {yearData.count}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TeachingSection() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<TeachingActivity[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    semester: '',
    year: '',
    studentsCount: '',
    evaluation: '',
    description: ''
  })

  useEffect(() => {
    if (user) {
      const userActivities = portfolioService.getUserTeachingActivities(user.id)
      setActivities(userActivities)
    }
  }, [user])

  const handleAdd = () => {
    if (!user) return

    const newActivity = portfolioService.addTeachingActivity(user.id, {
      ...formData,
      title: formData.courseName,
      studentsCount: formData.studentsCount ? parseInt(formData.studentsCount) : undefined,
      evaluation: formData.evaluation ? parseFloat(formData.evaluation) : undefined
    })

    setActivities(prev => [...prev, newActivity])
    setFormData({
      courseName: '',
      courseCode: '',
      semester: '',
      year: '',
      studentsCount: '',
      evaluation: '',
      description: ''
    })
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    if (portfolioService.deletePortfolioItem(id)) {
      setActivities(prev => prev.filter(activity => activity.id !== id))
    }
  }

  const handleFileUpload = (activityId: string, file: Omit<PortfolioFile, 'id' | 'uploadedAt'>) => {
    const uploadedFile = portfolioService.addFileToPortfolioItem(activityId, file)
    if (uploadedFile) {
      setActivities(prev => prev.map(activity => {
        if (activity.id === activityId) {
          return {
            ...activity,
            attachments: [...(activity.attachments || []), uploadedFile]
          }
        }
        return activity
      }))
    }
  }

  const handleFileRemove = (activityId: string, fileId: string) => {
    if (portfolioService.removeFileFromPortfolioItem(activityId, fileId)) {
      setActivities(prev => prev.map(activity => {
        if (activity.id === activityId) {
          return {
            ...activity,
            attachments: activity.attachments?.filter(file => file.id !== fileId) || []
          }
        }
        return activity
      }))
    }
  }

  if (!user) {
    return <div className="text-center text-gray-500">Пользователь не авторизован</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Преподавательская деятельность</h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Добавить курс
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название курса</label>
              <Input
                value={formData.courseName}
                onChange={(e) => setFormData(prev => ({ ...prev, courseName: e.target.value }))}
                placeholder="Введите название курса"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Код курса</label>
              <Input
                value={formData.courseCode}
                onChange={(e) => setFormData(prev => ({ ...prev, courseCode: e.target.value }))}
                placeholder="CS101, MATH201"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Семестр</label>
              <Input
                value={formData.semester}
                onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                placeholder="Осенний, Весенний, Летний"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Год</label>
              <Input
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                placeholder="2024"
                type="number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Количество студентов</label>
              <Input
                value={formData.studentsCount}
                onChange={(e) => setFormData(prev => ({ ...prev, studentsCount: e.target.value }))}
                placeholder="25"
                type="number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Оценка курса</label>
              <Input
                value={formData.evaluation}
                onChange={(e) => setFormData(prev => ({ ...prev, evaluation: e.target.value }))}
                placeholder="4.5"
                type="number"
                step="0.1"
                min="1"
                max="5"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Описание курса</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Опишите содержание курса, методы преподавания, достижения"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Save size={16} />
              Добавить
            </Button>
            <Button variant="outline" onClick={() => setIsAdding(false)} className="flex items-center gap-2">
              <X size={16} />
              Отмена
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{activity.courseName}</h3>
                {activity.courseCode && (
                  <p className="text-sm text-gray-500 mb-2">Код: {activity.courseCode}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Семестр:</span> {activity.semester}
                  </div>
                  <div>
                    <span className="font-medium">Год:</span> {activity.year}
                  </div>
                  {activity.studentsCount && (
                    <div>
                      <span className="font-medium">Студентов:</span> {activity.studentsCount}
                    </div>
                  )}
                  {activity.evaluation && (
                    <div>
                      <span className="font-medium">Оценка:</span> {activity.evaluation}/5
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <span className="font-medium text-gray-700">Описание:</span>
                  <p className="text-gray-600 mt-1">{activity.description}</p>
                </div>

                {/* Отображение файлов */}
                {activity.attachments && activity.attachments.length > 0 && (
                  <div className="mt-4">
                    <span className="font-medium text-gray-700">Материалы курса:</span>
                    <div className="mt-2 space-y-2">
                      {activity.attachments.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            {file.type === 'pdf' && <FileText size={16} className="text-red-500" />}
                            {file.type === 'image' && <Image size={16} className="text-green-500" />}
                            {file.type === 'document' && <File size={16} className="text-blue-500" />}
                            <span className="text-sm font-medium text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({Math.round(file.size / 1024)} KB)
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => window.open(file.url, '_blank')}
                              variant="outline"
                              className="px-2 py-1 text-xs"
                            >
                              <Download size={14} />
                            </Button>
                            <Button
                              onClick={() => handleFileRemove(activity.id, file.id)}
                              variant="outline"
                              className="px-2 py-1 text-xs text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Кнопка добавления файлов */}
                <div className="mt-4">
                  <FileUpload
                    onFileUpload={(file) => handleFileUpload(activity.id, file)}
                    onFileRemove={(fileId) => handleFileRemove(activity.id, fileId)}
                    existingFiles={activity.attachments || []}
                    maxFiles={5}
                    acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']}
                    maxSizeMB={10}
                  />
                </div>
              </div>
              <Button
                onClick={() => handleDelete(activity.id)}
                variant="outline"
                className="text-red-600 hover:text-red-700 ml-4"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
        
        {activities.length === 0 && !isAdding && (
          <div className="text-center text-gray-500 py-8">
            <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
            <p>У вас пока нет преподавательской деятельности</p>
            <p className="text-sm">Добавьте свой первый курс</p>
          </div>
        )}
      </div>
    </div>
  )
}

function AchievementsSection() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    date: '',
    category: 'certificate' as 'certificate' | 'diploma' | 'award' | 'test' | 'other',
    score: '',
    validityPeriod: '',
    description: ''
  })

  useEffect(() => {
    if (user) {
      const userAchievements = portfolioService.getUserAchievements(user.id)
      setAchievements(userAchievements)
    }
  }, [user])

  const handleAdd = () => {
    if (!user) return

    const newAchievement = portfolioService.addAchievement(user.id, formData)
    setAchievements(prev => [...prev, newAchievement])
    setFormData({
      title: '',
      issuer: '',
      date: '',
      category: 'certificate',
      score: '',
      validityPeriod: '',
      description: ''
    })
    setIsAdding(false)
  }

  const handleFileUpload = (achievementId: string, file: Omit<PortfolioFile, 'id' | 'uploadedAt'>) => {
    const uploadedFile = portfolioService.addFileToPortfolioItem(achievementId, file)
    if (uploadedFile) {
      setAchievements(prev => prev.map(achievement => {
        if (achievement.id === achievementId) {
          return {
            ...achievement,
            attachments: [...(achievement.attachments || []), uploadedFile]
          }
        }
        return achievement
      }))
    }
  }

  const handleFileRemove = (achievementId: string, fileId: string) => {
    if (portfolioService.removeFileFromPortfolioItem(achievementId, fileId)) {
      setAchievements(prev => prev.map(achievement => {
        if (achievement.id === achievementId) {
          return {
            ...achievement,
            attachments: achievement.attachments?.filter(file => file.id !== fileId) || []
          }
        }
        return achievement
      }))
    }
  }

  const handleDelete = (id: string) => {
    if (portfolioService.deletePortfolioItem(id)) {
      setAchievements(prev => prev.filter(achievement => achievement.id !== id))
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      certificate: 'Сертификат',
      diploma: 'Диплом',
      award: 'Награда',
      test: 'Тест',
      other: 'Другое'
    }
    return labels[category as keyof typeof labels] || category
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      certificate: 'bg-blue-100 text-blue-800',
      diploma: 'bg-green-100 text-green-800',
      award: 'bg-yellow-100 text-yellow-800',
      test: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (!user) {
    return <div className="text-center text-gray-500">Пользователь не авторизован</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Достижения и награды</h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Добавить достижение
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название достижения</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="IELTS, SAT Subject Test, AP Calculus"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Выдающая организация</label>
              <Input
                value={formData.issuer}
                onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                placeholder="Cambridge, College Board"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дата получения</label>
              <Input
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                placeholder="2024-01-15"
                type="date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'certificate' | 'diploma' | 'award' | 'test' | 'other' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="certificate">Сертификат</option>
                <option value="diploma">Диплом</option>
                <option value="award">Награда</option>
                <option value="test">Тест</option>
                <option value="other">Другое</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Результат/Балл</label>
              <Input
                value={formData.score}
                onChange={(e) => setFormData(prev => ({ ...prev, score: e.target.value }))}
                placeholder="7.5, 800, A+"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Срок действия</label>
              <Input
                value={formData.validityPeriod}
                onChange={(e) => setFormData(prev => ({ ...prev, validityPeriod: e.target.value }))}
                placeholder="2 года, бессрочно"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Опишите достижение, его значимость, полученные навыки"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Save size={16} />
              Добавить
            </Button>
            <Button variant="outline" onClick={() => setIsAdding(false)} className="flex items-center gap-2">
              <X size={16} />
              Отмена
            </Button>
          </div>
        </div>


      )}

      <div className="space-y-4">
        {achievements.map((achievement) => (
          <div key={achievement.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(achievement.category)}`}>
                    {getCategoryLabel(achievement.category)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Организация:</span> {achievement.issuer}
                  </div>
                  <div>
                    <span className="font-medium">Дата:</span> {achievement.date}
                  </div>
                  {achievement.score && (
                    <div>
                      <span className="font-medium">Результат:</span> {achievement.score}
                    </div>
                  )}
                  {achievement.validityPeriod && (
                    <div>
                      <span className="font-medium">Срок действия:</span> {achievement.validityPeriod}
                    </div>
                  )}
                </div>
                {achievement.description && (
                  <div className="mt-3">
                    <span className="font-medium text-gray-700">Описание:</span>
                    <p className="text-gray-600 mt-1">{achievement.description}</p>
                  </div>
                )}

                {/* Отображение файлов */}
                {achievement.attachments && achievement.attachments.length > 0 && (
                  <div className="mt-4">
                    <span className="font-medium text-gray-700">Документы:</span>
                    <div className="mt-2 space-y-2">
                      {achievement.attachments.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            {file.type === 'pdf' && <FileText size={16} className="text-red-500" />}
                            {file.type === 'image' && <Image size={16} className="text-green-500" />}
                            {file.type === 'document' && <File size={16} className="text-blue-500" />}
                            <span className="text-sm font-medium text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({Math.round(file.size / 1024)} KB)
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => window.open(file.url, '_blank')}
                              variant="outline"
                              className="px-2 py-1 text-xs"
                            >
                              <Download size={14} />
                            </Button>
                            <Button
                              onClick={() => handleFileRemove(achievement.id, file.id)}
                              variant="outline"
                              className="px-2 py-1 text-xs text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Кнопка добавления файлов */}
                <div className="mt-4">
                  <FileUpload
                    onFileUpload={(file) => handleFileUpload(achievement.id, file)}
                    onFileRemove={(fileId) => handleFileRemove(achievement.id, fileId)}
                    existingFiles={achievement.attachments || []}
                    maxFiles={5}
                    acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']}
                    maxSizeMB={10}
                  />
                </div>
              </div>
              <Button
                onClick={() => handleDelete(achievement.id)}
                variant="outline"
                className="text-red-600 hover:text-red-700 ml-4"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
        
        {achievements.length === 0 && !isAdding && (
          <div className="text-center text-gray-500 py-8">
            <Award size={48} className="mx-auto mb-4 text-gray-300" />
            <p>У вас пока нет достижений</p>
            <p className="text-sm">Добавьте свое первое достижение</p>
          </div>
        )}
      </div>
    </div>
  )
}

function AdditionalSection() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<AdditionalActivity[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    role: '',
    startDate: '',
    endDate: '',
    description: '',
    impact: ''
  })

  useEffect(() => {
    if (user) {
      const userActivities = portfolioService.getUserAdditionalActivities(user.id)
      setActivities(userActivities)
    }
  }, [user])

  const handleAdd = () => {
    if (!user) return

    const newActivity = portfolioService.addAdditionalActivity(user.id, {
      ...formData,
      endDate: formData.endDate || undefined
    })
    setActivities(prev => [...prev, newActivity])
    setFormData({
      title: '',
      organization: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
      impact: ''
    })
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    if (portfolioService.deletePortfolioItem(id)) {
      setActivities(prev => prev.filter(activity => activity.id !== id))
    }
  }

  if (!user) {
    return <div className="text-center text-gray-500">Пользователь не авторизован</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Дополнительная деятельность</h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Добавить деятельность
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название деятельности</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Волонтерство, конференция, проект"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Организация</label>
              <Input
                value={formData.organization}
                onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                placeholder="Название организации"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Роль/Позиция</label>
              <Input
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                placeholder="Участник, организатор, волонтер"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дата начала</label>
              <Input
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                type="date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дата окончания</label>
              <Input
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                type="date"
              />
              <p className="text-xs text-gray-500 mt-1">Оставьте пустым, если деятельность продолжается</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Влияние/Результат</label>
              <Input
                value={formData.impact}
                onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value }))}
                placeholder="Краткое описание результата"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Подробное описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Опишите вашу деятельность, обязанности, достижения"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Save size={16} />
              Добавить
            </Button>
            <Button variant="outline" onClick={() => setIsAdding(false)} className="flex items-center gap-2">
              <X size={16} />
              Отмена
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{activity.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Организация:</span> {activity.organization}
                  </div>
                  <div>
                    <span className="font-medium">Роль:</span> {activity.role}
                  </div>
                  <div>
                    <span className="font-medium">Период:</span> {activity.startDate}
                    {activity.endDate && ` - ${activity.endDate}`}
                    {!activity.endDate && ' - настоящее время'}
                  </div>
                  {activity.impact && (
                    <div>
                      <span className="font-medium">Результат:</span> {activity.impact}
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <span className="font-medium text-gray-700">Описание:</span>
                  <p className="text-gray-600 mt-1">{activity.description}</p>
                </div>
              </div>
              <Button
                onClick={() => handleDelete(activity.id)}
                variant="outline"
                className="text-red-600 hover:text-red-700 ml-4"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
        
        {activities.length === 0 && !isAdding && (
          <div className="text-center text-gray-500 py-8">
            <Activity size={48} className="mx-auto mb-4 text-gray-300" />
            <p>У вас пока нет дополнительной деятельности</p>
            <p className="text-sm">Добавьте свою первую деятельность</p>
          </div>
        )}
      </div>
    </div>
  )
}
