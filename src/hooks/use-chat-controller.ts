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
  initialModel,
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
      'x-ai-model-id': initialModel || model.id,
    },
    onResponse: (response) => {
      const headerChatId = response.headers.get('x-chat-id')

      if (headerChatId) {
        defineChatInstanceKey(headerChatId)
      }
    },

    onFinish: () => {
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
