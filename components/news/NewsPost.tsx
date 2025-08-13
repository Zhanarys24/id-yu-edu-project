'use client'

import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import { useEffect, useRef, useState } from 'react'
import {
  HeartIcon as OutlineHeart,
  ChatBubbleBottomCenterIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as SolidHeart, XMarkIcon } from '@heroicons/react/24/solid'

export default function NewsPost({
  title,
  image,
  description,
  date,
}: {
  title: string
  image: string
  description: string
  date: string
}) {
  const { t } = useTranslation('common')
  const [showModal, setShowModal] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(42)
  const [comments, setComments] = useState<string[]>([
    t('news.exampleComment1'),
    t('news.exampleComment2'),
    t('news.exampleComment3'),
  ])
  const [newComment, setNewComment] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleLike = () => {
    setLiked(!liked)
    setLikesCount(prev => prev + (liked ? -1 : 1))
  }

  const handleAddComment = () => {
    if (newComment.trim() === '') return
    setComments(prev => [...prev, newComment.trim()])
    setNewComment('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddComment()
    }
  }

  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showModal])

  return (
    <>
      {/* Главная карточка поста */}
      <div className="bg-white rounded-md shadow-sm overflow-hidden mb-6 w-full max-w-[600px] mx-auto border border-gray-200">
        <div className="relative w-full h-[400px]">
          <Image src={image} alt={title} fill className="object-cover" />
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-400 mb-1">{date}</p>
          <h2 className="font-semibold text-lg mb-2">{title}</h2>
          <div className="flex items-center gap-4 mb-2 text-gray-600">
            <button
              onClick={handleLike}
              className={`transition-transform duration-200 ${liked ? 'scale-110 text-red-500' : 'hover:text-red-400'}`}
            >
              {liked ? <SolidHeart className="w-6 h-6" /> : <OutlineHeart className="w-6 h-6" />}
            </button>
            <span className="text-sm text-gray-500">{likesCount} {t('news.likes')}</span>
            <button
              onClick={() => setShowModal(true)}
              className="hover:text-blue-500 transition ml-auto"
            >
              <ChatBubbleBottomCenterIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-700 line-clamp-2">{description}</p>
        </div>
      </div>

      {/* 🔵 Модалка поста */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden relative">
            {/* ❌ Кнопка закрытия */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black z-10"
              onClick={() => setShowModal(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Верх: изображение + текст */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* Левая часть (фото + заголовок) */}
              <div className="w-full lg:w-2/3 bg-white flex flex-col">
                <div className="relative flex-1 min-h-[300px]">
                  <Image src={image} alt={title} fill className="object-contain" />
                </div>
                <div className="bg-white px-6 py-4 border-t">
                  <h2 className="font-semibold text-lg text-gray-800">{title}</h2>
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                </div>
              </div>

              {/* Правая часть (комментарии) */}
              <div className="w-full lg:w-1/3 flex flex-col bg-white border-l">
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {comments.map((comment, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Image
                        src="/avatar-placeholder.png"
                        alt="avatar"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div className="bg-gray-100 rounded px-3 py-2 max-w-[90%]">
                        <p className="text-sm font-semibold text-gray-800">Пользователь {idx + 1}</p>
                        <p className="text-sm text-gray-700">{comment}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Поле ввода */}
                <div className="p-4 border-t flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={t('news.commentPlaceholder')}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    onClick={handleAddComment}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded"
                  >
                    {t('news.send')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
