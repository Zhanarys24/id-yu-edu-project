'use client'

import { createContext, useState, useContext } from 'react'

const AvatarContext = createContext<{
  avatar: string
  setAvatar: (url: string) => void
}>({
  avatar: '/avatar.jpg',
  setAvatar: () => {},
})

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const [avatar, setAvatar] = useState('/avatar.jpg')

  return (
    <AvatarContext.Provider value={{ avatar, setAvatar }}>
      {children}
    </AvatarContext.Provider>
  )
}

export const useAvatar = () => useContext(AvatarContext)
