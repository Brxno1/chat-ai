'use client'

import { type Message as UIMessage } from '@ai-sdk/react'
import React from 'react'
import { toast } from 'sonner'

import { ChatWithMessages } from '@/app/api/chat/actions/get-chats'
import { models } from '@/app/chat/models/definitions'
import { useChatController } from '@/hooks/use-chat-controller'
import { useTranscribeAudio } from '@/hooks/use-transcribe-audio'
import { useChatStore } from '@/store/chat'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

import { ChatContext, ChatContextProps } from './context'

export type ChatProviderProps = {
  children: React.ReactNode
  initialChats?: ChatWithMessages[]
  initialMessages?: (UIMessage & Partial<ChatMessageType>)[]
  currentChatId?: string
  cookieModel?: string | undefined
}

export function ChatProvider({
  children,
  initialMessages,
  currentChatId,
  cookieModel,
  initialChats,
}: ChatProviderProps) {
  const buttonSubmitRef = React.useRef<HTMLButtonElement | null>(null)
  const { model, setModel, resetChatState } = useChatStore()

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

  const onResetChat = () => {
    setMessages([])
    resetChatState()
  }

  const onModelChange = (name: string) => {
    const selectedModel = models.find((m) => m.name === name)

    if (selectedModel) {
      setModel({
        id: selectedModel.id,
        name: selectedModel.name,
        provider: selectedModel.provider,
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

  const onAudioRecorded = (
    audioBlob: Blob | null,
    onSetAudio: (audio: File) => void,
  ) => {
    if (audioBlob) {
      const audioFile = new File([audioBlob], 'user-audio.webm', {
        type: 'audio/webm',
      })

      onSetAudio(audioFile)
    }
  }

  const value: ChatContextProps = {
    chats: initialChats || [],
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
    onAudioRecorded,
    onStop,
    onResetChat,
    buttonSubmitRef,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
