'use client'

import { createContext, useState, useContext, useEffect } from 'react'

const UserContext = createContext<{
  avatar: string
  setAvatar: (url: string) => void
  userName: string
  setUserName: (name: string) => void
}>({
  avatar: '/avatar.jpg',
  setAvatar: () => {},
  userName: 'Жанарыс Имангалиев',
  setUserName: () => {},
})

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const [avatar, setAvatar] = useState('/avatar.jpg')
  const [userName, setUserName] = useState('Жанарыс Имангалиев')
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage after hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAvatar = localStorage.getItem('user.avatar')
      const savedName = localStorage.getItem('user.name')
      
      // Set defaults if nothing in localStorage
      if (!savedAvatar) {
        localStorage.setItem('user.avatar', '/avatar.jpg')
      } else {
        setAvatar(savedAvatar)
      }
      
      if (!savedName) {
        localStorage.setItem('user.name', 'Жанарыс Имангалиев')
      } else {
        setUserName(savedName)
      }
      
      setIsHydrated(true)
    }
  }, [])

  // Listen for localStorage changes from other tabs/pages
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user.avatar' && e.newValue) {
        setAvatar(e.newValue)
      }
      if (e.key === 'user.name' && e.newValue) {
        setUserName(e.newValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Save to localStorage when avatar changes
  const handleSetAvatar = (url: string) => {
    setAvatar(url)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user.avatar', url)
      // Trigger storage event for same tab (since storage event doesn't fire on same tab)
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user.avatar',
        newValue: url,
      }))
    }
  }

  // Save to localStorage when userName changes
  const handleSetUserName = (name: string) => {
    setUserName(name)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user.name', name)
      // Trigger storage event for same tab
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user.name',
        newValue: name,
      }))
    }
  }

  return (
    <UserContext.Provider value={{ 
      avatar, 
      setAvatar: handleSetAvatar, 
      userName, 
      setUserName: handleSetUserName 
    }}>
      {children}
    </UserContext.Provider>
  )
}

export const useAvatar = () => useContext(UserContext)
