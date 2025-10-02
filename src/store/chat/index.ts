import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { models } from '@/app/chat/models/definitions'
import { GenerateSuggestionsResponse } from '@/hooks/use-generate-suggestions'
import { Model } from '@/types/model'

interface State {
  chatId: string | undefined
  isGhostChatMode: boolean
  isCreatingNewChat: boolean
  suggestions: GenerateSuggestionsResponse[]
  isLoadingSuggestions: boolean
  model: Model
  chatInstanceKey: string
  isRateLimitReached: boolean
}

interface Actions {
  setChatId: (id: string | undefined) => void
  setIsCreatingNewChat: (value: boolean) => void
  defineChatToGhostMode: (mode: boolean | ((prev: boolean) => boolean)) => void
  setSuggestions: (suggestions: GenerateSuggestionsResponse[]) => void
  setIsLoadingSuggestions: (loading: boolean) => void
  setModel: (model: Model) => void
  resetChatState: () => void
  resetModel: () => void
  setIsRateLimitReached: (value: boolean) => void
  defineChatInstanceKey: (key: string) => void
  getChatInstanceKey: () => string
}

const defaultModel: Model = {
  id: models[0].id,
  name: models[0].name,
  provider: models[0].provider,
}

type UseChatStoreProps = {
  initialModel?: Model
}

const createChatStore = (props?: UseChatStoreProps) =>
  create<State & Actions>()(
    persist(
      (set, get) => ({
        chatId: undefined,
        isRateLimitReached: false,
        isGhostChatMode: false,
        isCreatingNewChat: false,
        model: props?.initialModel || defaultModel,
        chatInstanceKey: '',
        suggestions: [],
        isLoadingSuggestions: false,
        setChatId: (id) => set({ chatId: id }),

        setIsCreatingNewChat: (value) => set({ isCreatingNewChat: value }),

        defineChatToGhostMode: (mode) => {
          if (typeof mode === 'function') {
            set((state) => ({ isGhostChatMode: mode(state.isGhostChatMode) }))
          } else {
            set({ isGhostChatMode: mode })
          }
        },

        setSuggestions: (suggestions) => set({ suggestions }),

        setIsLoadingSuggestions: (loading) =>
          set({ isLoadingSuggestions: loading }),

        setModel: (model) => set({ model }),

        setIsRateLimitReached: (value) => set({ isRateLimitReached: value }),

        defineChatInstanceKey: (key) => set({ chatInstanceKey: key }),

        getChatInstanceKey: () => get().chatInstanceKey,

        resetChatState: () => {
          set({
            chatId: undefined,
            isCreatingNewChat: false,
            isGhostChatMode: false,
            chatInstanceKey: '',
            suggestions: [],
          })
        },

        resetModel: () => {
          set({
            model: defaultModel,
          })
        },
      }),
      {
        name: 'chat-model-storage',
        partialize: ({ model }) => ({
          model,
        }),
      },
    ),
  )

export const useChatStore = createChatStore()

export function initializeChatStore(props?: UseChatStoreProps) {
  const store = createChatStore(props)
  return store()
}
