'use client'

import { type UIMessage } from 'ai'
import { ChangeEvent, createContext, useContext } from 'react'

import { Chat } from '@/services/database/generated'
import type { ChatStreamStatus } from '@/types/chat'
import type { Model } from '@/types/model'

type SendMessageOptions = {
  files?: File[]
  body?: Record<string, unknown>
}

type States = {
  chats?: Chat[]
  input: string
  messages: UIMessage[]
  status: 'streaming' | 'error' | 'submitted' | 'ready'
  streamStatus: ChatStreamStatus
  isTranscribing: boolean
  model: Model
}

type Actions = {
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  buttonSubmitRef: React.RefObject<HTMLButtonElement | null>
  setMessages: (messages: UIMessage[]) => void
  setInput: (input: string) => void
  onInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onSubmitChat: (
    event?: {
      preventDefault?: () => void
    },
    options?: SendMessageOptions,
  ) => void
  onModelChange: (value: string) => void
  onStop: () => void
  onGenerateTranscribe: (audio: Blob | null) => Promise<void>
  onResetChat: () => void
  onRegenerateResponse: () => void
  onAudioRecorded: (
    audio: Blob | null,
    onSetAudio: (audio: File) => void,
  ) => void
}

export type ChatContextProps = States & Actions

export const ChatContext = createContext<ChatContextProps | null>(null)

export function useChatInstance() {
  const context = useContext(ChatContext)

  if (!context) {
    throw new Error('useChatInstance must be used within a ChatProvider')
  }

  return context
}
