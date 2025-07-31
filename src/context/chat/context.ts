'use client'

import { type Message as UIMessage } from '@ai-sdk/react'
import type { ChatRequestOptions } from 'ai'
import { ChangeEvent, createContext, useContext } from 'react'

import { ChatWithMessages } from '@/app/api/chat/actions/get-chats'

type States = {
  chats?: ChatWithMessages[]
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
  onSubmitChat: (
    event?: {
      preventDefault?: () => void
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void
  onModelChange: (value: string) => void
  onStop: () => void
  onGenerateTranscribe: (audio: Blob | null) => Promise<void>
  onResetChat: () => void
  buttonSubmitRef: React.RefObject<HTMLButtonElement | null>
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
