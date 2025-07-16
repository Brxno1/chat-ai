'use client'

import { type Message as UIMessage } from '@ai-sdk/react'
import React from 'react'
import { toast } from 'sonner'

import { useChatController } from '@/hooks/use-chat-controller'
import { useTranscribeAudio } from '@/hooks/use-transcribe-audio'
import { useChatStore } from '@/store/chat-store'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

import { models } from '../../models/definitions'
import { ChatForm } from './form'
import { ChatMessage } from './message'

interface ChatProps {
  initialMessages?: (UIMessage & Partial<ChatMessageType>)[]
  currentChatId?: string
}

export function Chat({ initialMessages, currentChatId }: ChatProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const { model, setModel, chatInstanceKey } = useChatStore()
  const { mutateAsync: transcribeAudio } = useTranscribeAudio()

  const {
    input,
    messages,
    setMessages,
    status,
    handleInputChange,
    handleSubmit,
    append,
    stop,
  } = useChatController({
    initialMessages,
    currentChatId,
  })

  React.useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  })

  React.useEffect(() => {
    if (chatInstanceKey && !initialMessages?.length) {
      setMessages([])
    }
  }, [chatInstanceKey, initialMessages, setMessages])

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

  return (
    <div className="flex h-full w-full flex-col rounded-lg rounded-b-xl border border-input">
      <div
        className="flex-1 space-y-3 overflow-auto p-2.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-md"
        ref={containerRef}
      >
        {messages.map((message) => (
          <ChatMessage
            key={`${message.id}`}
            message={message}
            modelName={model.name}
            modelProvider={model.provider}
            isStreaming={status === 'streaming'}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>
      <ChatForm
        onSubmitChat={onSubmitChat}
        onModelChange={handleModelChange}
        onGenerateTranscribe={handleGenerateTranscribe}
        status={status}
        input={input}
        onInputChange={handleInputChange}
        model={model}
        stop={stop}
      />
    </div>
  )
}
