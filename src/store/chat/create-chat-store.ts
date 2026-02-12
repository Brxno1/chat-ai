import { Message } from '@ai-sdk/react'
import { persist } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'

import { Chat } from '@/services/database/generated'
import { models } from '@/app/chat/models/definitions'
import { Model } from '@/types/model'

export interface StateChatStore {
  chats: Chat[] | []
  chatId: string | undefined
  isGhostChatMode: boolean
  messages: Message[]
  isCreatingNewChat: boolean
  model: Model
  chatInstanceKey: string
  isRateLimitReached: boolean
}

export interface ActionsChatStore {
  setChatId: (id: string | undefined) => void
  setIsCreatingNewChat: (value: boolean) => void
  defineChatToGhostMode: (mode: boolean) => void
  setMessages: (messages: Message[]) => void
  onDeleteMessage: (id: string) => void
  setModel: (model: Model) => void
  resetChatState: () => void
  resetModelState: () => void
  setIsRateLimitReached: (value: boolean) => void
  setChats: (chats: Chat[]) => void
  defineChatInstanceKey: (key: string) => void
  getChatInstanceKey: () => string
}

const defaultModel: Model = {
  id: models[0].id,
  name: models[0].name,
  provider: models[0].provider,
}

export function createChatStore() {
  return createStore<StateChatStore & ActionsChatStore>()(
    persist(
      (set, get) => ({
        chats: [],
        chatId: undefined,
        isRateLimitReached: false,
        isGhostChatMode: false,
        messages: [],
        isCreatingNewChat: false,
        model: defaultModel,
        chatInstanceKey: '',

        setChats: (chats) => set({ chats }),

        setChatId: (id) => set({ chatId: id }),

        setIsCreatingNewChat: (value) => set({ isCreatingNewChat: value }),

        defineChatToGhostMode: (mode) => set({ isGhostChatMode: mode }),

        setMessages: (messages) => set({ messages }),

        setModel: (model) => set({ model }),

        setIsRateLimitReached: (value) => set({ isRateLimitReached: value }),

        defineChatInstanceKey: (key) => set({ chatInstanceKey: key }),

        getChatInstanceKey: () => get().chatInstanceKey,

        onDeleteMessage: (id) =>
          set((state) => ({
            messages: state.chatId === id ? [] : state.messages,
          })),

        resetChatState: () => {
          set({
            chatId: undefined,
            messages: [],
            isCreatingNewChat: true,
            isGhostChatMode: false,
            chatInstanceKey: '',
          })
        },

        resetModelState: () => {
          set({
            model: defaultModel,
          })
        },
      }),
      {
        name: 'chat-model-storage',
        partialize: (state) => ({
          model: state.model,
        }),
      },
    ),
  )
}
