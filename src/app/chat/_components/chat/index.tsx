'use client'

import React from 'react'

import { useChatInstance } from '@/context/chat'

import { ChatForm } from './form'
import { ChatMessage } from './message'

export function Chat() {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const { messages, append } = useChatInstance()

  React.useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  })

  const handlePromptClick = (promptText: string) => {
    append({
      role: 'user',
      content: promptText,
      createdAt: new Date(),
    })
  }

  return (
    <div className="flex h-full flex-col space-y-2 rounded-lg border border-input p-2">
      <div
        className="flex-1 overflow-auto px-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-md"
        ref={containerRef}
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div
                onClick={() => handlePromptClick('O que é inteligência artificial?')}
                className="flex h-32 w-64 cursor-pointer items-center justify-center rounded-lg border border-input bg-background p-4 text-center text-sm transition-colors hover:bg-muted"
              >
                "O que é inteligência artificial?"
              </div>
              <div
                onClick={() => handlePromptClick('Como posso aprender programação?')}
                className="flex h-32 w-64 cursor-pointer items-center justify-center rounded-lg border border-input bg-background p-4 text-center text-sm transition-colors hover:bg-muted"
              >
                "Como posso aprender programação?"
              </div>
              <div
                onClick={() => handlePromptClick('Explique um conceito matemático interessante')}
                className="flex h-32 w-64 cursor-pointer items-center justify-center rounded-lg border border-input bg-background p-4 text-center text-sm transition-colors hover:bg-muted"
              >
                "Explique um conceito matemático interessante"
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={`${message.id}`} message={message} />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatForm />
    </div>
  )
}
