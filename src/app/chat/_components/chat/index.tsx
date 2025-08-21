'use client'

import React from 'react'

import { GradientText } from '@/components/react-bits/GradientText/GradientText'
import { useChatInstance } from '@/context/chat'
import { useSessionUser } from '@/context/user'

import { ChatForm } from './form'
import { ChatMessage } from './message'
import { SuggestionCards } from './suggestion-wrapper'

export function Chat() {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const { messages } = useChatInstance()
  const { user } = useSessionUser()

  React.useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
  })

  return (
    <div className="flex h-full flex-col space-y-2 rounded-lg border border-input p-2">
      <div className="flex-1 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-md">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-10">
            {user && (
              <GradientText
                colors={['#ff2894', '#7216ce', '#0063d4', '#55ccff']}
                className="text-4xl"
              >
                Olá, {user.name}!
              </GradientText>
            )}
            <SuggestionCards />
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
