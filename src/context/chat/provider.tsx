'use client'

import React from 'react'
import { toast } from 'sonner'

import { models } from '@/app/chat/models/definitions'
import { useChatController } from '@/hooks/use-chat-controller'
import { useTranscribeAudio } from '@/hooks/use-transcribe-audio'
import { useChatStore } from '@/store/chat'

import { ChatContext, ChatProviderProps } from './context'

export function ChatProvider({
  children,
  initialMessages,
  currentChatId,
}: ChatProviderProps) {
  const { model, setModel } = useChatStore()
  const [isTranscribing, setIsTranscribing] = React.useState(false)

  const { mutateAsync: transcribeAudio } = useTranscribeAudio()

  const {
    input,
    messages,
    status,
    handleInputChange,
    handleSubmit,
    append,
    stop,
  } = useChatController({
    initialMessages,
    currentChatId,
  })

  const handleModelChange = (value: string) => {
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

  const handleGenerateTranscribe = async (audio: Blob | null) => {
    if (!audio) return

    setIsTranscribing(true)

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
    } finally {
      setIsTranscribing(false)
    }
  }

  const value = {
    input,
    messages,
    status,
    isTranscribing,
    onInputChange: handleInputChange,
    onSubmitChat,
    onModelChange: handleModelChange,
    onGenerateTranscribe: handleGenerateTranscribe,
    model,
    stop,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
