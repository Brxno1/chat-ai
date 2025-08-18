'use client'

import React from 'react'

import { useChatInstance } from '@/context/chat'

import { ChatForm } from './form'
import { ChatMessage } from './message'

export function Chat() {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const { messages, onInputChange, buttonSubmitRef } = useChatInstance()

  React.useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
  })

  return (
    <div className="flex h-full flex-col space-y-2 rounded-lg border border-input p-2">
      <div className="flex-1 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-md">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_1fr]">
                <div
                  onClick={() => {
                    const text = 'Qual a melhor forma de economizar dinheiro?'
                    const event = {
                      target: { value: text },
                      /* eslint-disable-next-line */
                      preventDefault: () => { },
                    } as React.ChangeEvent<HTMLTextAreaElement>

                    onInputChange(event)
                    setTimeout(() => buttonSubmitRef?.current?.click(), 50)
                  }}
                  className="flex h-28 cursor-pointer items-center justify-center rounded-lg border border-input bg-card p-2.5 text-center text-sm hover:bg-accent"
                >
                  "Qual a melhor forma de economizar dinheiro?"
                </div>
                <div
                  onClick={() => {
                    const text =
                      'Recomende filmes para assistir no final de semana'
                    const event = {
                      target: { value: text },
                      /* eslint-disable-next-line */
                      preventDefault: () => { },
                    } as React.ChangeEvent<HTMLTextAreaElement>

                    onInputChange(event)
                    setTimeout(() => buttonSubmitRef?.current?.click(), 50)
                  }}
                  className="flex h-28 cursor-pointer items-center justify-center rounded-lg border border-input bg-card p-2.5 text-center text-sm hover:bg-accent"
                >
                  "Recomende filmes para assistir no final de semana"
                </div>
                <div
                  onClick={() => {
                    const text = 'Como posso aprender programação?'
                    const event = {
                      target: { value: text },
                      /* eslint-disable-next-line */
                      preventDefault: () => { },
                    } as React.ChangeEvent<HTMLTextAreaElement>

                    onInputChange(event)
                    setTimeout(() => buttonSubmitRef?.current?.click(), 50)
                  }}
                  className="flex h-28 cursor-pointer items-center justify-center rounded-lg border border-input bg-card p-2.5 text-center text-sm hover:bg-accent"
                >
                  "Como posso aprender programação?"
                </div>
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
