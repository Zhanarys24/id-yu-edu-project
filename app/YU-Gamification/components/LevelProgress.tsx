'use client'

interface LevelProgressProps {
  level: number
  xp: number
  xpNeeded: number
}

export function LevelProgress({ level, xp, xpNeeded }: LevelProgressProps) {
  const percent = (xp / xpNeeded) * 100

  return (
    <div className="rounded-2xl border p-6 shadow-sm bg-white">
      <h3 className="text-lg font-semibold mb-2">Уровень {level}</h3>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div
          className="bg-indigo-500 h-3 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-sm text-gray-600">
        Опыт: {xp} / {xpNeeded}
      </p>
    </div>
  )
}
