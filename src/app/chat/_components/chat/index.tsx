'use client'

import React from 'react'

import { useChatInstance } from '@/context/chat'

import { ChatForm } from './form'
import { ChatMessage } from './message'
import { ChatWelcome } from './welcome'

export function Chat() {
  const scrollToBottomRef = React.useRef<HTMLDivElement>(null)

  const { messages } = useChatInstance()

  React.useLayoutEffect(() => {
    scrollToBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  })

  return (
    <div className="flex h-full flex-col space-y-2 rounded-lg border border-input p-2">
      <div className="flex-1 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-md">
        {messages.length === 0 ? (
          <ChatWelcome />
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={`${message.id}`} message={message} />
            ))}
            <div ref={scrollToBottomRef} />
          </>
        )}
      </div>
      <ChatForm />
    </div>
  )
}
