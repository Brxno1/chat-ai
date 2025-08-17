import { Session, User } from 'next-auth'
import { createStore, StoreApi } from 'zustand'

interface State {
  session: Session | null
  user: User | undefined
}

interface Actions {
  setUser: (
    userOrFn: User | ((prev: User | undefined) => User | undefined),
  ) => void
}

export type UserState = State & Actions

type UseUserStoreProps = {
  initialSession?: Session | null
  initialUser?: User
  notifications?: Notification[]
}

export function createUserStore({
  initialSession,
  initialUser,
}: UseUserStoreProps): StoreApi<UserState> {
  return createStore<State & Actions>()((set) => ({
    session: initialSession || null,
    user: initialUser || undefined,
    setUser: (userOrFn) =>
      set((state) => ({
        user: typeof userOrFn === 'function' ? userOrFn(state.user) : userOrFn,
      })),
  }))
}
