'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { processChatAndSaveMessages } from '@/app/api/chat/services/chat-processor'

export function useChatMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>
      name?: string
      locale: string
      chatId?: string
      isGhostChatMode?: boolean
      model: string
    }) => {
      return processChatAndSaveMessages(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })
}
