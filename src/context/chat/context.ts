'use client'

import { type Message as UIMessage } from '@ai-sdk/react'
import React, { ChangeEvent, createContext, useContext } from 'react'

import type { ChatMessage as ChatMessageType } from '@/types/chat'

export interface ChatContextProps {
  input: string
  messages: UIMessage[]
  status: 'streaming' | 'error' | 'submitted' | 'ready'
  isTranscribing: boolean
  onInputChange: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
  ) => void
  onSubmitChat: () => void
  onModelChange: (value: string) => void
  onGenerateTranscribe: (audio: Blob | null) => Promise<void>
  model: {
    id: string
    name: string
    provider: string
    disabled?: boolean
  }
  stop: () => void
}

export interface ChatProviderProps {
  children: React.ReactNode
  initialMessages?: (UIMessage & Partial<ChatMessageType>)[]
  currentChatId?: string
}

export const ChatContext = createContext<ChatContextProps | null>(null)

export function useChatContext() {
  const context = useContext(ChatContext)

  if (!context) {
    throw new Error('useChatContext deve ser usado dentro de um ChatProvider')
  }

  return context
}
