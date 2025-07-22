'use client'

import { type Message as UIMessage } from '@ai-sdk/react'
import { ChangeEvent, createContext, useContext } from 'react'

type States = {
  input: string
  messages: UIMessage[]
  status: 'streaming' | 'error' | 'submitted' | 'ready'
  isTranscribing: boolean
  model: {
    id: string
    name: string
    provider: string
    disabled?: boolean
  }
}

type Actions = {
  setMessages: (messages: UIMessage[]) => void
  onInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onSubmitChat: () => void
  onModelChange: (value: string) => void
  onStop: () => void
  onGenerateTranscribe: (audio: Blob | null) => Promise<void>
  onAttachImages: (imageUrls: string[], content: string) => void
}

export type ChatContextProps = States & Actions

export const ChatContext = createContext<ChatContextProps | null>(null)

export function useChatContext() {
  const context = useContext(ChatContext)

  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }

  return context
}
