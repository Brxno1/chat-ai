import { Message } from '@ai-sdk/react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { ChatWithMessages } from '@/app/api/chat/actions/get-chats'
import { models } from '@/app/chat/models/definitions'
import { Model } from '@/types/model'

interface State {
  chats: ChatWithMessages[] | []
  chatId: string | undefined
  isGhostChatMode: boolean
  messages: Message[]
  isCreatingNewChat: boolean
  model: Model
  chatInstanceKey: string
  isRateLimitReached: boolean
}

interface Actions {
  setChatId: (id: string | undefined) => void
  setIsCreatingNewChat: (value: boolean) => void
  setToGhostChatMode: (mode: boolean) => void
  setMessages: (messages: Message[]) => void
  onDeleteMessage: (id: string) => void
  setModel: (model: Model) => void
  resetChatState: () => void
  resetModelState: () => void
  setIsRateLimitReached: (value: boolean) => void
  setChats: (chats: ChatWithMessages[]) => void
  defineChatInstanceKey: (key: string) => void
  getChatInstanceKey: () => string
}

const defaultModel: Model = {
  id: models[0].id,
  name: models[0].name,
  provider: models[0].provider,
}

type UseChatStoreProps = {
  initialChats?: ChatWithMessages[]
}

const createChatStore = (initialProps?: UseChatStoreProps) =>
  create<State & Actions>()(
    persist(
      (set, get) => ({
        chats: initialProps?.initialChats || [],
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

        setToGhostChatMode: (mode) => set({ isGhostChatMode: mode }),

        setMessages: (messages) => set({ messages }),

        setModel: (model) => set({ model }),

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

export const useChatStore = createChatStore()

export function initializeChatStore(props?: UseChatStoreProps) {
  return createChatStore(props)
}
