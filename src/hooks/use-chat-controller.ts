'use client'

import { useChat } from '@ai-sdk/react'
import { useQueryClient } from '@tanstack/react-query'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useRouter } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'

import { useSessionUser } from '@/context/user'
import { queryKeys } from '@/lib/query-client'
import { useChatStore } from '@/store/chat'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

type UseChatControllerProps = {
  initialMessages?: (UIMessage & Partial<ChatMessageType>)[] | undefined
  currentChatId?: string | undefined
  initialModel?: string
}

type MessageMetadata = {
  createdAt?: number
  finishReason?: string
  model?: string
  totalTokens?: number
}

export function useChatController({
  initialMessages,
  currentChatId,
}: UseChatControllerProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { user } = useSessionUser()

  const setSuggestions = useChatStore((state) => state.setSuggestions)

  const stableId = React.useRef(
    currentChatId ||
      useChatStore.getState().getChatInstanceKey() ||
      crypto.randomUUID(),
  ).current

  return useChat({
    id: stableId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      headers: () => {
        const { isGhostChatMode, model } = useChatStore.getState()
        return {
          'x-user-name': user?.name || '',
          'x-user-id': user?.id || '',
          'x-chat-id': currentChatId || '',
          'x-ghost-mode': String(isGhostChatMode),
          'x-ai-model': model.id,
        }
      },
      fetch: async (input, init) => {
        const response = await fetch(input, init)
        const chatId = response.headers.get('x-chat-id')

        if (chatId?.trim()) {
          useChatStore.getState().defineChatInstanceKey(chatId)
        }

        return response
      },
    }),

    onFinish: async ({ messages }) => {
      setSuggestions([])

      const { isGhostChatMode, getChatInstanceKey } = useChatStore.getState()

      if (isGhostChatMode) return

      queryClient.invalidateQueries({ queryKey: queryKeys.chats.all })

      if (currentChatId) return

      const lastMessage = messages[messages.length - 1]
      const metadata = lastMessage?.metadata as MessageMetadata | undefined

      if (metadata?.finishReason === 'stop') {
        const chatKey = getChatInstanceKey()
        if (chatKey) {
          window.history.pushState(null, '', `/chat/${chatKey}`)
          router.prefetch(`/chat/${chatKey}`)
        }
      }
    },

    onError: (error) => {
      console.error('[chat]', error)
      toast.error('Erro ao gerar resposta', { position: 'top-center' })
    },
  })
}
