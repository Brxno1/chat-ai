'use client'

import { type Message as UIMessage, useChat } from '@ai-sdk/react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { useSessionUser } from '@/context/user'
import { queryKeys } from '@/lib/query-client'
import { useChatStore } from '@/store/chat'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

type UseChatControllerProps = {
  initialMessages?: (UIMessage & Partial<ChatMessageType>)[] | undefined
  currentChatId?: string | undefined
  initialModel?: string
}

export function useChatController({
  initialMessages,
  currentChatId,
}: UseChatControllerProps) {
  const queryClient = useQueryClient()
  const router = useRouter()

  const model = useChatStore((state) => state.model)
  const isGhostChatMode = useChatStore((state) => state.isGhostChatMode)
  const {
    defineChatInstanceKey,
    getChatInstanceKey,
    setSuggestions,
  } = useChatStore()

  const { user } = useSessionUser()

  return useChat({
    initialMessages,
    key: currentChatId || getChatInstanceKey(),
    api: '/api/chat',
    headers: {
      'x-user-name': user?.name || '',
      'x-user-id': user?.id || '',
      'x-chat-id': currentChatId || '',
      'x-ghost-mode': String(isGhostChatMode),
      'x-ai-model': model.id,
    },
    onResponse: (response) => {
      setSuggestions([])
      const headerChatId = response.headers.get('x-chat-id')

      if (headerChatId) {
        defineChatInstanceKey(headerChatId)
      }
    },
    onFinish: async () => {
      if (!isGhostChatMode) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.chats.all,
        })

        if (!currentChatId) {
          const currentKey = getChatInstanceKey()
          if (currentKey) {
            router.push(`/chat/${currentKey}`)
          }
        }
      }
    },
    onError: (error) => {
      console.log(error)
    },
  })
}
