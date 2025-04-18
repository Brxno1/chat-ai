import { useContext } from 'react'

import { UserContext } from '@/context/user-provider'

export const useSessionUser = () => {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useSessionUser must be used within a UserProvider')
  }

  return context
}
