'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, Trash2, CheckCircle, AlertCircle } from 'lucide-react'

interface Document {
  id: string
  filename: string
  category: string
  chunks: string[]
  createdAt: string
}

export default function JolserikKnowledgePage() {
  const [uploading, setUploading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('general')

  useEffect(() => {
    loadDocuments()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверяем размер файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Файл слишком большой. Максимум 10MB.' })
      return
    }

    // Проверяем тип файла
    const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Неподдерживаемый тип файла. Используйте PDF, Word или TXT.' })
      return
    }

    setUploading(true)
    setMessage(null)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', selectedCategory)

    try {
      const response = await fetch('/api/jolserik/knowledge/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ Документ "${file.name}" успешно обработан! Создано ${result.chunks} фрагментов для поиска.` 
        })
        loadDocuments()
        // Очищаем input
        e.target.value = ''
      } else {
        setMessage({ type: 'error', text: '❌ Ошибка загрузки: ' + result.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Ошибка сети: ' + error })
    } finally {
      setUploading(false)
    }
  }

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/jolserik/knowledge/list')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }

  const deleteDocument = async (id: string) => {
    if (!confirm('Удалить этот документ из базы знаний?')) return

    try {
      const response = await fetch(`/api/jolserik/knowledge/delete/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Документ удален' })
        loadDocuments()
      } else {
        setMessage({ type: 'error', text: 'Ошибка удаления' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка сети' })
    }
  }

  const testSearch = async () => {
    const query = prompt('Введите тестовый вопрос для поиска:')
    if (!query) return

    try {
      const response = await fetch('/api/jolserik/knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 3 })
      })

      const result = await response.json()
      
      if (result.success) {
        const resultText = result.results.length > 0 
          ? `Найдено ${result.results.length} результатов:\n\n${result.results.map((r: any) => `📄 ${r.content.substring(0, 200)}...`).join('\n\n')}`
          : 'Ничего не найдено'
        
        alert(`Результат поиска:\n\n${resultText}`)
      }
    } catch (error) {
      alert('Ошибка поиска: ' + error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">База знаний Jolserik AI</h1>
        <p className="text-gray-600 mb-8">Загружайте документы для обучения AI-помощника</p>
        
        {/* Сообщения */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {message.text}
          </div>
        )}

        {/* Загрузка документов */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            <Upload className="h-5 w-5 inline mr-2" />
            Загрузка документов для обучения Jolserik AI
          </h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              id="fileInput"
              className="hidden"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <label 
              htmlFor="fileInput"
              className={`cursor-pointer inline-flex flex-col items-center ${uploading ? 'opacity-50' : ''}`}
            >
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <span className="text-lg font-medium text-gray-900 mb-2">
                {uploading ? 'Загрузка...' : 'Выберите файлы для загрузки'}
              </span>
              <span className="text-sm text-gray-500">
                Поддерживаются форматы: PDF, DOCX, TXT
              </span>
            </label>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория документа
            </label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="general">Общая информация</option>
              <option value="navigation">Навигация по кампусу</option>
              <option value="academic">Учебные вопросы</option>
              <option value="documents">Документы и справки</option>
              <option value="dormitory">Общежитие</option>
              <option value="services">Услуги и сервисы</option>
            </select>
          </div>
        </div>

        {/* Список загруженных документов */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            <FileText className="h-5 w-5 inline mr-2" />
            Загруженные документы ({documents.length})
          </h2>
          
          {documents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Документы еще не загружены. Загрузите первый документ выше.
            </p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">{doc.filename}</h3>
                      <p className="text-sm text-gray-500">
                        Категория: {doc.category} • {doc.chunks.length} фрагментов • {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="text-red-600 hover:text-red-800 p-2 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
