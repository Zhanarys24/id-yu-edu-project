'use client'

import { createContext, useState, useContext } from 'react'

const UserContext = createContext<{
  avatar: string
  setAvatar: (url: string) => void
  userName: string
  setUserName: (name: string) => void
}>({
  avatar: '/avatar.jpg',
  setAvatar: () => {},
  userName: 'Альбина Тілекбай',
  setUserName: () => {},
})

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const [avatar, setAvatar] = useState('/avatar.jpg')
  const [userName, setUserName] = useState('Альбина Тілекбай')

  return (
    <UserContext.Provider value={{ avatar, setAvatar, userName, setUserName }}>
      {children}
    </UserContext.Provider>
  )
}

export const useAvatar = () => useContext(UserContext)
