'use client'

import { createContext, useState, useContext, useEffect } from 'react'
import { useAuth } from './AuthContext'

const UserContext = createContext<{
  avatar: string
  setAvatar: (url: string) => void
  updateAvatar: (url: string) => Promise<void>
  userName: string
  setUserName: (name: string) => void
  userPosition: string
  isUpdating: boolean
}>({
  avatar: '',
  setAvatar: () => {},
  updateAvatar: async () => {},
  userName: '',
  setUserName: () => {},
  userPosition: '',
  isUpdating: false,
})

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const { user, updateAvatar: updateUserAvatar } = useAuth()
  const [avatar, setAvatar] = useState('')
  const [userName, setUserName] = useState('')
  const [userPosition, setUserPosition] = useState('')
  const [isHydrated, setIsHydrated] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Clean up any previously stored demo/local values and hydrate
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Remove known demo values
    if (localStorage.getItem('user.name') === 'Жанарыс Имангалиев') {
      localStorage.removeItem('user.name')
    }
    if (localStorage.getItem('user.position') === 'Преподаватель') {
      localStorage.removeItem('user.position')
    }
    if (localStorage.getItem('user.avatar') === '/avatar.jpg') {
      localStorage.removeItem('user.avatar')
    }

    // Optionally clear any leftovers to ensure only API-driven data is shown
    // localStorage.removeItem('user.name')
    // localStorage.removeItem('user.position')
    // localStorage.removeItem('user.avatar')

    setIsHydrated(true)
  }, [])

  // Update userName, position and avatar when user data changes
  useEffect(() => {
    if (!isHydrated) return
    if (user) {
      setUserName(user.name || '')
      setUserPosition(user.position || '')
      setAvatar(user.avatar || '')
    } else {
      setUserName('')
      setUserPosition('')
      setAvatar('')
    }
  }, [user, isHydrated])

  // No cross-tab syncing via localStorage; AvatarContext reflects only API-driven AuthContext.user

  // Save to localStorage when avatar changes
  const handleSetAvatar = (url: string) => {
    // Only update local UI state; persistent storage comes from API updates via AuthContext
    setAvatar(url)
  }

  // Save to localStorage when userName changes
  const handleSetUserName = (name: string) => {
    // Local-only update; authoritative data should come from API/AuthContext
    setUserName(name)
  }

  // Update avatar through API
  const handleUpdateAvatar = async (url: string) => {
    if (!updateUserAvatar) {
      console.warn('updateUserAvatar function not available');
      return;
    }

    setIsUpdating(true);
    try {
      await updateUserAvatar(url);
      // Аватар уже обновится через useEffect, который слушает изменения user
    } catch (error) {
      console.error('Failed to update avatar:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <UserContext.Provider value={{ 
      avatar, 
      setAvatar: handleSetAvatar,
      updateAvatar: handleUpdateAvatar,
      userName, 
      setUserName: handleSetUserName,
      userPosition,
      isUpdating
    }}>
      {children}
    </UserContext.Provider>
  )
}

export const useAvatar = () => useContext(UserContext)
