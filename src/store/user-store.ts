import { Session } from 'next-auth'
import { create } from 'zustand'

type UserState = {
  user: Session['user'] | null
  syncUser: (user: Session['user'] | null) => void
}

export const useSessionStore = create<UserState>((set) => ({
  user: null,
  syncUser: (user) => set({ user }),
}))
