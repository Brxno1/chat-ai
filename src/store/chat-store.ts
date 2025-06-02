import { Message } from '@ai-sdk/react'
import { create } from 'zustand'

interface State {
  chatId: string | undefined
  isGhostChatMode: boolean
  messages: Message[]
  isCreatingNewChat: boolean
  model: string
}

interface Actions {
  setChatId: (id: string | undefined) => void
  setIsCreatingNewChat: (value: boolean) => void
  setToGhostChatMode: (mode: boolean) => void
  setMessages: (messages: Message[]) => void
  onDeleteMessage: (id: string) => void
  resetChat: () => void
  onCreateNewChat: () => void
  setModel: (model: string) => void
  resetChatState: () => void
  setAiMessages: (messages: Message[]) => void
}

type ChatState = State & Actions

export const useChatStore = create<ChatState>((set, get) => ({
  chatId: undefined,
  isGhostChatMode: false,
  messages: [],
  isCreatingNewChat: false,
  model: 'gpt-4o-mini',

  setChatId: (id) => set({ chatId: id }),

  setIsCreatingNewChat: (value) => set({ isCreatingNewChat: value }),

  setToGhostChatMode: (mode) => set({ isGhostChatMode: mode }),

  setMessages: (messages) => set({ messages }),

  onDeleteMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((message) => message.id !== id),
    })),
  resetChat: () => {
    set({
      chatId: undefined,
      messages: [],
      isCreatingNewChat: false,
    })

    const { setAiMessages } = get()
    setAiMessages([])
  },

  resetChatState: () => {
    set({
      chatId: undefined,
      messages: [],
      isCreatingNewChat: false,
    })
  },

  onCreateNewChat: () => {
    const { resetChatState } = get()
    set({
      chatId: undefined,
      messages: [],
      isCreatingNewChat: false,
    })
    resetChatState()
  },
  setModel: (model) => set({ model }),
  setAiMessages: (messages) => set({ messages }),
}))
