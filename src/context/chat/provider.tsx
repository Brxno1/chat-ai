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
}

export function ChatProvider({
  children,
  initialMessages,
  currentChatId,
}: ChatProviderProps) {
  const { model, setModel } = useChatStore()

  const { mutateAsync: transcribeAudio, isPending: isTranscribing } =
    useTranscribeAudio()

  const {
    input,
    messages,
    setMessages,
    status,
    handleInputChange: onInputChange,
    handleSubmit,
    append,
    stop: onStop,
  } = useChatController({
    initialMessages,
    currentChatId,
  })

  const onModelChange = (value: string) => {
    const selectedModel = models.find((m) => m.name === value)

    if (selectedModel) {
      setModel({
        id: selectedModel.id,
        name: selectedModel.name,
        provider: selectedModel.provider,
        disabled: selectedModel.disabled,
      })
    }
  }

  const onSubmitChat = () => {
    handleSubmit()
  }

  const onGenerateTranscribe = async (audio: Blob | null) => {
    if (!audio) return

    console.log('audio', audio)

    try {
      const { transcription } = await transcribeAudio(audio)

      append({
        id: crypto.randomUUID(),
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
    } catch (error) {
      console.error(error)
      toast.error('Erro ao enviar áudio', { position: 'top-center' })
    }
  }

  const value = {
    input,
    messages,
    status,
    isTranscribing,
    setMessages,
    onInputChange,
    onSubmitChat,
    onModelChange,
    onGenerateTranscribe,
    model,
    onStop,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
