import { Session } from 'next-auth'
import { create } from 'zustand'

type UserState = {
  user: Session['user'] | null
  setUser: (user: Session['user'] | null) => void
}

export const useSessionUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
