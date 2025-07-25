'use client'

import React from 'react'

import { useChatContext } from '@/context/chat'

import { ChatForm } from './form'
import { ChatMessage } from './message'

export function Chat() {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const { messages } = useChatContext()

  React.useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  })

  return (
    <div className="flex h-full flex-col space-y-2 rounded-lg border border-input p-2">
      <div
        className="flex-1 overflow-auto px-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-md"
        ref={containerRef}
      >
        {messages.map((message) => (
          <ChatMessage key={`${message.id}`} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatForm />
    </div>
  )
}
