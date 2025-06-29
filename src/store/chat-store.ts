import { Message } from '@ai-sdk/react'
import { Chat } from '@prisma/client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { models } from '@/app/chat/_components/models'

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
  modelProvider: string
  chatInstanceKey: string
  isRateLimitReached: boolean
  chatIsDeleting: boolean
}

interface Actions {
  setChatId: (id: string | undefined) => void
  setIsCreatingNewChat: (value: boolean) => void
  setToGhostChatMode: (mode: boolean) => void
  setMessages: (messages: Message[]) => void
  onDeleteMessage: (id: string) => void
  setModel: (model: string) => void
  setModelProvider: (provider: string) => void
  resetChatState: () => void
  resetModelState: () => void
  setIsRateLimitReached: (value: boolean) => void
  setChats: (chats: Chats['chats']) => void
  defineChatInstanceKey: (key: string) => void
  getChatInstanceKey: () => string
  setChatIsDeleting: (value: boolean) => void
}

export const useChatStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      chats: null,
      chatId: undefined,
      isRateLimitReached: false,
      isGhostChatMode: false,
      messages: [],
      isCreatingNewChat: false,
      model: models[0].id,
      modelProvider: models[0].provider,
      chatInstanceKey: '',
      chatIsDeleting: false,

      setChats: (chats) => set({ chats }),

      setChatId: (id) => set({ chatId: id }),

      setIsCreatingNewChat: (value) => set({ isCreatingNewChat: value }),

      setToGhostChatMode: (mode) => set({ isGhostChatMode: mode }),

      setMessages: (messages) => set({ messages }),

      setModel: (model) => set({ model }),

      setModelProvider: (provider) => set({ modelProvider: provider }),

      setIsRateLimitReached: (value) => set({ isRateLimitReached: value }),

      defineChatInstanceKey: (key) => set({ chatInstanceKey: key }),

      getChatInstanceKey: () => get().chatInstanceKey,

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
          chatInstanceKey: '',
        })
      },

      resetModelState: () => {
        set({
          model: models[0].name,
          modelProvider: models[0].provider,
        })
      },

      setChatIsDeleting: (value) => set({ chatIsDeleting: value }),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        model: state.model,
        modelProvider: state.modelProvider,
      }),
    },
  ),
)
