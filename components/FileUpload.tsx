'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, Image, File, Trash2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PortfolioFile } from '@/lib/types/portfolio'

interface FileUploadProps {
  onFileUpload: (file: Omit<PortfolioFile, 'id' | 'uploadedAt'>) => void
  onFileRemove?: (fileId: string) => void
  existingFiles?: PortfolioFile[]
  maxFiles?: number
  acceptedTypes?: string[]
  maxSizeMB?: number
}

export default function FileUpload({
  onFileUpload,
  onFileRemove,
  existingFiles = [],
  maxFiles = 5,
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  maxSizeMB = 10
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processFiles(files)
  }, [])

  const processFiles = useCallback((files: File[]) => {
    const validFiles = files.filter(file => {
      // Проверка типа файла
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!acceptedTypes.includes(fileExtension)) {
        alert(`Файл ${file.name} имеет неподдерживаемый формат`)
        return false
      }

      // Проверка размера
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`Файл ${file.name} слишком большой. Максимальный размер: ${maxSizeMB}MB`)
        return false
      }

      // Проверка количества файлов
      if (existingFiles.length + uploadingFiles.length >= maxFiles) {
        alert(`Максимальное количество файлов: ${maxFiles}`)
        return false
      }

      return true
    })

    setUploadingFiles(prev => [...prev, ...validFiles])
  }, [acceptedTypes, maxSizeMB, existingFiles.length, uploadingFiles.length, maxFiles])

  const handleUpload = useCallback(async (file: File) => {
    try {
      // В реальном приложении здесь будет загрузка на сервер
      // Для демо используем FileReader для создания локального URL
      const reader = new FileReader()
      
      reader.onload = () => {
        const fileData: Omit<PortfolioFile, 'id' | 'uploadedAt'> = {
          name: file.name,
          type: getFileType(file.name),
          url: reader.result as string,
          size: file.size
        }
        
        onFileUpload(fileData)
        setUploadingFiles(prev => prev.filter(f => f !== file))
      }
      
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error)
      alert('Ошибка при загрузке файла')
    }
  }, [onFileUpload])

  const getFileType = (fileName: string): 'pdf' | 'image' | 'document' => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    if (['pdf'].includes(extension || '')) return 'pdf'
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) return 'image'
    return 'document'
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText size={20} className="text-red-500" />
      case 'image':
        return <Image size={20} className="text-green-500" />
      default:
        return <File size={20} className="text-blue-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const canUploadMore = existingFiles.length + uploadingFiles.length < maxFiles

  return (
    <div className="space-y-4">
      {/* Область загрузки */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Перетащите файлы сюда или нажмите для выбора
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Поддерживаемые форматы: {acceptedTypes.join(', ')} | Максимальный размер: {maxSizeMB}MB
        </p>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={!canUploadMore}
          className="px-6 py-2"
        >
          Выбрать файлы
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Файлы в процессе загрузки */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Загружаются файлы:</h4>
          {uploadingFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getFileIcon(getFileType(file.name))}
                <div>
                  <p className="font-medium text-gray-700">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                onClick={() => handleUpload(file)}
                className="px-3 py-1 text-sm"
              >
                Загрузить
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Существующие файлы */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Загруженные файлы:</h4>
          {existingFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                {getFileIcon(file.type)}
                <div>
                  <p className="font-medium text-gray-700">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => window.open(file.url, '_blank')}
                  variant="outline"
                  size="sm"
                  className="px-3 py-1"
                >
                  <Download size={16} />
                </Button>
                {onFileRemove && (
                  <Button
                    onClick={() => onFileRemove(file.id)}
                    variant="outline"
                    size="sm"
                    className="px-3 py-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Информация о лимитах */}
      <div className="text-sm text-gray-500">
        Загружено файлов: {existingFiles.length + uploadingFiles.length} / {maxFiles}
      </div>
    </div>
  )
}
