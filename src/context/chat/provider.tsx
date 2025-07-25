'use client'

import { type Message as UIMessage } from '@ai-sdk/react'
import React from 'react'
import { toast } from 'sonner'

import { models } from '@/app/chat/models/definitions'
import { useChatController } from '@/hooks/use-chat-controller'
import { useTranscribeAudio } from '@/hooks/use-transcribe-audio'
import { useChatStore } from '@/store/chat'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

import { ChatContext } from './context'

export type ChatProviderProps = {
  children: React.ReactNode
  initialMessages?: (UIMessage & Partial<ChatMessageType>)[]
  currentChatId?: string
  cookieModel: string | undefined
}

export function ChatProvider({
  children,
  initialMessages,
  currentChatId,
  cookieModel,
}: ChatProviderProps) {
  const { model, setModel, chatInstanceKey } = useChatStore()

  const { mutateAsync: transcribeAudio, isPending: isTranscribing } =
    useTranscribeAudio()

  const {
    input,
    messages,
    setMessages,
    status,
    handleInputChange: onInputChange,
    handleSubmit: onSubmitChat,
    append,
    stop: onStop,
  } = useChatController({
    initialMessages,
    currentChatId,
    initialModel: cookieModel,
  })

  const onModelChange = (name: string) => {
    const selectedModel = models.find((m) => m.name === name)

    if (selectedModel) {
      setModel({
        id: selectedModel.id,
        name: selectedModel.name,
        provider: selectedModel.provider,
        disabled: selectedModel.disabled,
      })
    }
  }

  const onGenerateTranscribe = async (audio: Blob | null) => {
    if (!audio) return

    try {
      const { transcription } = await transcribeAudio(audio)

      append({
        role: 'user',
        content: transcription,
        parts: [
          {
            type: 'text',
            text: transcription,
          },
        ],
        createdAt: new Date(),
      })
    } catch (_error) {
      toast.error('Erro ao enviar áudio', { position: 'top-center' })
    }
  }

  React.useEffect(() => {
    if (chatInstanceKey && !messages?.length) {
      setMessages([])
    }
  }, [chatInstanceKey, messages])

  const value = {
    model,
    input,
    messages,
    status,
    isTranscribing,
    setMessages,
    onInputChange,
    onSubmitChat,
    onModelChange,
    onGenerateTranscribe,
    onStop,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
