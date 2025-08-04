import { Bell } from 'lucide-react'

export default function Header() {
  return (
    <div className="flex justify-end items-center gap-4">
      <Bell className="w-5 h-5 text-gray-500 cursor-pointer" />
      <select className="text-sm border border-gray-300 rounded px-2 py-1">
        <option>Русский</option>
        <option>Қазақша</option>
        <option>English</option>
      </select>
    </div>
  )
}
