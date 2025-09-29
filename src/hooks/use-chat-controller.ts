'use client'

import { type Message as UIMessage, useChat } from '@ai-sdk/react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { useSessionUser } from '@/context/user'
import { queryKeys } from '@/lib/query-client'
import { useChatStore } from '@/store/chat'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

import { useGenerateSuggestions } from './use-generate-suggestions'

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
    setIsLoadingSuggestions,
  } = useChatStore()

  const { user } = useSessionUser()

  const { mutateAsync: generateSuggestions } = useGenerateSuggestions()

  return useChat({
    initialMessages,
    key: currentChatId || getChatInstanceKey(),
    api: '/api/chat',
    headers: {
      'x-user-name': user?.name || '',
      'x-user-id': user?.id || '',
      'x-chat-id': currentChatId || '',
      'x-ghost-mode': isGhostChatMode.toString(),
      'x-ai-model': model.id,
    },
    onResponse: (response) => {
      setSuggestions([])
      const headerChatId = response.headers.get('x-chat-id')

      if (headerChatId) {
        defineChatInstanceKey(headerChatId)
      }
    },
    onFinish: async (message) => {
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

      try {
        setIsLoadingSuggestions(true)
        const suggestions = await generateSuggestions({ message })
        setSuggestions(suggestions)
      } catch (error) {
        console.error('Error generating suggestions:', error)
      } finally {
        setIsLoadingSuggestions(false)
      }
    },
    onError: (error) => {
      console.log(error)
    },
  })
}
