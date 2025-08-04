// components/news/NewsCard.tsx
'use client'
import Image from 'next/image'

export default function NewsCard({
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
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
      <Image src={image} alt={title} width={600} height={300} className="w-full h-40 object-cover" />
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-1">{date}</p>
        <h2 className="text-lg font-semibold mb-1">{title}</h2>
        <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
      </div>
    </div>
  )
}
