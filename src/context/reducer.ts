import { User } from 'next-auth'

const SET_USER = 'SET_USER' as const
const UPDATE_USER = 'UPDATE_USER' as const
const SET_CREATING_CHAT = 'SET_CREATING_CHAT' as const

type UserState = {
  user: User | undefined
  isCreatingChat: boolean
}

type UserAction =
  | { type: typeof SET_USER; payload: User | undefined }
  | {
      type: typeof UPDATE_USER
      payload: (prev: User | undefined) => User | undefined
    }
  | { type: typeof SET_CREATING_CHAT; payload: boolean }

export const userReducer = (
  state: UserState,
  action: UserAction,
): UserState => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload }
    case UPDATE_USER:
      return { ...state, user: action.payload(state.user) }
    case SET_CREATING_CHAT:
      return { ...state, isCreatingChat: action.payload }
    default:
      return state
  }
}
