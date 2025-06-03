import { Message } from '@ai-sdk/react'
import { create } from 'zustand'

interface State {
  chatId: string | undefined
  isGhostChatMode: boolean
  messages: Message[]
  isCreatingNewChat: boolean
  model: string
  chatInstanceKey: string
}

interface Actions {
  setChatId: (id: string | undefined) => void
  setIsCreatingNewChat: (value: boolean) => void
  setToGhostChatMode: (mode: boolean) => void
  setMessages: (messages: Message[]) => void
  onDeleteMessage: (id: string) => void
  onCreateNewChat: () => void
  setModel: (model: string) => void
  resetChatState: () => void
  resetChatInstance: () => void
}

type ChatState = State & Actions

export const useChatStore = create<ChatState>((set, get) => ({
  chatId: undefined,
  isGhostChatMode: false,
  messages: [],
  isCreatingNewChat: false,
  model: 'gpt-4o-mini',
  chatInstanceKey: Date.now().toString(),

  setChatId: (id) => set({ chatId: id }),

  setIsCreatingNewChat: (value) => set({ isCreatingNewChat: value }),

  setToGhostChatMode: (mode) => set({ isGhostChatMode: mode }),

  setMessages: (messages) => set({ messages }),

  setModel: (model) => set({ model }),

  onDeleteMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((message) => message.id !== id),
    })),

  resetChatState: () => {
    set({
      chatId: undefined,
      messages: [],
      isCreatingNewChat: false,
      isGhostChatMode: false,
    })
  },

  resetChatInstance: () => {
    set({
      chatInstanceKey: Date.now().toString(),
    })
  },

  onCreateNewChat: () => {
    const { resetChatState } = get()
    resetChatState()
  },
}))
