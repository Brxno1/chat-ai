'use client'

import { type FileUIPart, type UIMessage } from 'ai'
import React from 'react'
import { toast } from 'sonner'

import { models } from '@/app/chat/models/definitions'
import { useChatController } from '@/hooks/use-chat-controller'
import { useDerivedStreamStatus } from '@/hooks/use-derived-stream-status'
import { useTranscribeAudio } from '@/hooks/use-transcribe-audio'
import { Chat } from '@/services/database/generated/client'
import { useChatStore } from '@/store/chat'
import type { ChatMessage } from '@/types/chat'

import { ChatContext, ChatContextProps } from './context'

export type ChatProviderProps = {
  children: React.ReactNode
  initialChats?: Chat[]
  initialMessages?: (UIMessage & Partial<ChatMessage>)[]
  currentChatId?: string
  cookieModel?: string | undefined
}

type SendMessageOptions = {
  files?: File[]
  body?: Record<string, unknown>
}

export function ChatProvider({
  children,
  initialMessages,
  currentChatId,
  cookieModel,
  initialChats,
}: ChatProviderProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const buttonSubmitRef = React.useRef<HTMLButtonElement | null>(null)
  const isSendingRef = React.useRef(false)
  const [input, setInput] = React.useState('')

  const model = useChatStore((state) => state.model)
  const setModel = useChatStore((state) => state.setModel)
  const resetChatState = useChatStore((state) => state.resetChatState)

  const { mutateAsync: transcribeAudio, isPending: isTranscribing } =
    useTranscribeAudio()

  const {
    messages,
    setMessages,
    status,
    sendMessage,
    stop: onStop,
    regenerate,
  } = useChatController({
    initialMessages,
    currentChatId,
    initialModel: cookieModel,
  })

  const streamStatus = useDerivedStreamStatus(status, messages)

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const onSubmitChat = async (
    event?: { preventDefault?: () => void },
    options?: SendMessageOptions,
  ) => {
    event?.preventDefault?.()

    if (
      isSendingRef.current ||
      status !== 'ready' ||
      (!input.trim() && !options?.files?.length)
    ) {
      return
    }

    isSendingRef.current = true

    try {
      const fileParts: FileUIPart[] = []

      if (options?.files) {
        for (const file of options.files) {
          const base64 = await fileToBase64(file)
          fileParts.push({
            type: 'file',
            mediaType: file.type,
            filename: file.name,
            url: base64,
          })
        }
      }

      setInput('')

      await sendMessage({
        text: input,
        files: fileParts.length > 0 ? fileParts : undefined,
        metadata: {
          createdAt: Date.now(),
        },
      })
    } finally {
      isSendingRef.current = false
    }
  }

  const onRegenerateResponse = () => {
    const lastAssistantMsg = messages.findLast((m) => m.role === 'assistant')

    regenerate({
      headers: {
        'x-regenerate-id': lastAssistantMsg?.id ?? '',
      },
    })
  }

  const onResetChat = () => {
    setMessages([])
    setInput('')
    resetChatState()
  }

  const onModelChange = (id: string) => {
    const selectedModel = models.find((m) => m.id === id)

    if (selectedModel) {
      setModel(selectedModel)
    }
  }

  const onGenerateTranscribe = async (audio: Blob | null) => {
    if (!audio) return

    try {
      const { transcription } = await transcribeAudio(audio)

      sendMessage({ text: transcription })
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
    buttonSubmitRef,
    inputRef,
    messages,
    status,
    streamStatus,
    isTranscribing,
    setMessages,
    setInput,
    onInputChange,
    onSubmitChat,
    onModelChange,
    onGenerateTranscribe,
    onAudioRecorded,
    onStop,
    onResetChat,
    onRegenerateResponse,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
  })
}
