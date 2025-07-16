import { type Message as UIMessage, useChat } from '@ai-sdk/react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { useSessionUser } from '@/context/user-provider'
import { queryKeys } from '@/lib/query-client'
import { useChatStore } from '@/store/chat-store'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

type UseChatControllerProps = {
  initialMessages: (UIMessage & Partial<ChatMessageType>)[] | undefined
  currentChatId: string | undefined
}

export function useChatController({
  initialMessages,
  currentChatId,
}: UseChatControllerProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { model, isGhostChatMode, defineChatInstanceKey, getChatInstanceKey } =
    useChatStore()

  const { user } = useSessionUser()

  return useChat({
    initialMessages,
    key: currentChatId || getChatInstanceKey(),
    api: '/api/chat',
    headers: {
      'x-user-name': user?.name || '',
      'x-user-id': user?.id || '',
      'x-chat-id': currentChatId || '',
      'x-ghost-mode': isGhostChatMode.toString(),
      'x-ai-model-id': model.id,
    },
    onError: (error) => {
      console.log(error)
    },
    onResponse: (response) => {
      const headerChatId = response.headers?.get('x-chat-id')

      if (headerChatId) {
        defineChatInstanceKey(headerChatId)
      }
    },

    onFinish: () => {
      if (!isGhostChatMode) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.chats.all,
        })

        const currentKey = getChatInstanceKey()
        if (currentKey) {
          setTimeout(() => {
            router.push(`/chat/${currentKey}`)
          }, 2000)
        }
      }
    },
  })
}
