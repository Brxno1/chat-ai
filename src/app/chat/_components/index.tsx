'use client'

import React from 'react'

import { useChatInstance } from '@/context/chat'

import { ChatForm } from './form'
import { ChatMessage } from './message'
import { TypingIndicator } from '@/components/ui/typing-indicator'

export function Chat() {
  const scrollToBottomRef = React.useRef<HTMLDivElement>(null)

  const { messages, streamStatus } = useChatInstance()

  React.useLayoutEffect(() => {
    scrollToBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  })

  const showTypingIndicator =
    streamStatus === 'submitted' || streamStatus === 'streaming'

  return (
    <div className="flex h-full flex-col space-y-2 rounded-lg border border-input p-2">
      <div className="mb-[1rem] flex-1 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-md">
        {messages.map((message) => (
          <ChatMessage key={`${message.id}`} message={message} />
        ))}
        {showTypingIndicator && (
          <div className="flex w-full items-start">
            <TypingIndicator />
          </div>
        )}
        <div ref={scrollToBottomRef} />
      </div>
      <ChatForm />
    </div>
  )
}
