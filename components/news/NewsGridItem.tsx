'use client'
import Image from 'next/image'

export default function NewsGridItem({ image, alt }: { image: string; alt: string }) {
  return (
    <div className="relative aspect-square w-full h-auto cursor-pointer hover:opacity-90 transition">
      <Image
        src={image}
        alt={alt}
        fill
        className="object-cover rounded-md"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
    </div>
  )
}
