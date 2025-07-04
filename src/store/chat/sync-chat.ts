'use client'

import React from 'react'

import { Chat } from '@/services/database/generated'

import { useChatStore } from '../chat-store'

type MessageFromChat = {
  id: string
  createdAt: Date
  userId: string | null
  role: string
  chatId: string
  parts?: unknown
}

type SyncChatProps = {
  initialChats: (Chat & { messages: MessageFromChat[] })[] | null
}

export function SyncChat({ initialChats }: SyncChatProps) {
  const { setChats } = useChatStore()

  React.useEffect(() => {
    setChats(initialChats)
  }, [initialChats])

  return null
}
