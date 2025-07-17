'use client'

import { type Message as UIMessage } from '@ai-sdk/react'
import React from 'react'

import { ChatProvider, useChatContext } from '@/context/chat'
import { useChatStore } from '@/store/chat'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

import { ChatForm } from './form'
import { ChatMessage } from './message'

interface ChatProps {
  initialMessages?: (UIMessage & Partial<ChatMessageType>)[]
  currentChatId?: string
}

function ChatContent() {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { messages, status, model } = useChatContext()

  React.useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  })

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
      <ChatForm />
    </div>
  )
}

export function Chat({ initialMessages, currentChatId }: ChatProps) {
  const { chatInstanceKey } = useChatStore()
  const [localMessages, setLocalMessages] = React.useState(initialMessages)

  React.useEffect(() => {
    if (chatInstanceKey && !initialMessages?.length) {
      setLocalMessages([])
    }
  }, [chatInstanceKey, initialMessages])

  return (
    <ChatProvider initialMessages={localMessages} currentChatId={currentChatId}>
      <ChatContent />
    </ChatProvider>
  )
}
