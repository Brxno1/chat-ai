import { Message } from '@ai-sdk/react'
import { Chat } from '@prisma/client'
import { create } from 'zustand'

type MessageFromChat = {
  id: string
  createdAt: Date
  userId: string | null
  content: string
  role: string
  chatId: string
}

type Chats = {
  chats: (Chat & { messages: MessageFromChat[] })[] | null
}

interface State {
  chats: Chats['chats']
  chatId: string | undefined
  isGhostChatMode: boolean
  messages: Message[]
  isCreatingNewChat: boolean
  model: string
  chatInstanceKey: string
  isRateLimitReached: boolean
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
  setIsRateLimitReached: (value: boolean) => void
  setChats: (chats: Chats['chats']) => void
}

type ChatState = State & Actions

export const useChatStore = create<ChatState>((set, get) => ({
  chats: null,
  chatId: undefined,
  isRateLimitReached: false,
  isGhostChatMode: false,
  messages: [],
  isCreatingNewChat: false,
  model: 'gpt-4o-mini',
  chatInstanceKey: Date.now().toString(),

  setChats: (chats) => set({ chats }),

  setChatId: (id) => set({ chatId: id }),

  setIsCreatingNewChat: (value) => set({ isCreatingNewChat: value }),

  setToGhostChatMode: (mode) => set({ isGhostChatMode: mode }),

  setMessages: (messages) => set({ messages }),

  setModel: (model) => set({ model }),

  setIsRateLimitReached: (value) => set({ isRateLimitReached: value }),

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
    const { resetChatState, resetChatInstance } = get()
    resetChatInstance()
    resetChatState()
  },
}))
