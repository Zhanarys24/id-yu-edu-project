'use client'

interface Student {
  id: number
  name: string
  coins: number
  level: number
}

const mockStudents: Student[] = [
  { id: 1, name: 'Иван Петров', coins: 1200, level: 12 },
  { id: 2, name: 'Алия Садыкова', coins: 1100, level: 11 },
  { id: 3, name: 'Данияр Ахметов', coins: 1000, level: 10 },
  { id: 4, name: 'Светлана Иванова', coins: 950, level: 9 },
  { id: 5, name: 'Жандос Мусаев', coins: 900, level: 9 },
]

export function Leaderboard() {
  return (
    <div className="rounded-2xl border shadow-sm bg-white overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-indigo-100">
          <tr>
            <th className="p-3">#</th>
            <th className="p-3">Имя</th>
            <th className="p-3">Уровень</th>
            <th className="p-3">Коины</th>
          </tr>
        </thead>
        <tbody>
          {mockStudents.map((student, index) => (
            <tr
              key={student.id}
              className={`border-t ${
                index === 0
                  ? 'bg-yellow-50'
                  : index === 1
                  ? 'bg-gray-50'
                  : index === 2
                  ? 'bg-orange-50'
                  : ''
              }`}
            >
              <td className="p-3 font-semibold">{index + 1}</td>
              <td className="p-3">{student.name}</td>
              <td className="p-3">{student.level}</td>
              <td className="p-3">{student.coins} 🪙</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
