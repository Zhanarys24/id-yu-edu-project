'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

export function AvatarUploadTest() {
  const { uploadAvatarFile } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setSuccess('')
    setIsUploading(true)

    try {
      await uploadAvatarFile(file)
      setSuccess('Аватарка успешно загружена!')
    } catch (err) {
      setError('Ошибка при загрузке аватарки')
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Тест загрузки аватарки</h3>
      
      <div className="space-y-4">
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {isUploading && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Загрузка...
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 text-sm">
            {success}
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>• Поддерживаемые форматы: JPG, PNG, GIF</p>
          <p>• Максимальный размер: 1MB</p>
          <p>• Максимальное разрешение: 1920x1080</p>
          <p>• Автоматическое уменьшение при превышении разрешения</p>
        </div>
      </div>
    </div>
  )
}
