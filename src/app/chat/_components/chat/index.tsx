'use client'

import React from 'react'

import { useChatContext } from '@/context/chat'
import { useChatStore } from '@/store/chat'

import { ChatForm } from './form'
import { ChatMessage } from './message'

export function Chat() {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const { chatInstanceKey } = useChatStore()

  const { messages, status, model, setMessages } = useChatContext()

  React.useEffect(() => {
    if (chatInstanceKey && !messages?.length) {
      setMessages([])
    }
  }, [chatInstanceKey, messages])

  React.useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  })

  return (
    <div className="flex h-full w-full flex-col rounded-lg border border-input p-2">
      <div
        className="flex-1 space-y-3 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-md"
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
