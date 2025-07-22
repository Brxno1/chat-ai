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

type ImageAttachment = {
  type: 'image'
  url: string
}

type Attachment = ImageAttachment

export type ChatProviderProps = {
  children: React.ReactNode
  initialMessages?: (UIMessage & Partial<ChatMessageType>)[]
  currentChatId?: string
  cookieModel: string
}

export function ChatProvider({
  children,
  initialMessages,
  currentChatId,
  cookieModel,
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

  const onSubmitChat = () => {
    handleSubmit()
  }

  const onAttachImages = (imageUrls: string[], content: string) => {
    if (!imageUrls.length) return

    try {
      const attachments: Attachment[] = imageUrls.map((url) => ({
        type: 'image',
        url,
      }))

      append({
        role: 'user',
        content,
        experimental_attachments: attachments,
        createdAt: new Date(),
      })
    } catch (error) {
      console.error(error)
      toast.error('Erro ao enviar imagens', { position: 'top-center' })
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
    onAttachImages,
    model,
    onStop,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
