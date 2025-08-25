'use client'

interface QuestCardProps {
  title: string
  progress: number
  total: number
  reward: number
}

export function QuestCard({ title, progress, total, reward }: QuestCardProps) {
  const percent = (progress / total) * 100

  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-indigo-500 h-2 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-sm text-gray-600">
        Прогресс: {progress}/{total} • Награда: {reward} 🪙
      </p>
    </div>
  )
}
