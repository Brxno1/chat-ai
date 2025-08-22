'use client'

import { useChatInstance } from '@/context/chat'

export function SuggestionCards() {
  const suggestions = [
    'Qual a melhor forma de economizar dinheiro?',
    'Qual a melhor forma de investir?',
    'Como posso aprender a programar?',
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {suggestions.map((suggestion, index) => (
        <Card key={index} suggestion={suggestion} />
      ))}
    </div>
  )
}

function Card({ suggestion }: { suggestion: string }) {
  const { onInputChange, buttonSubmitRef } = useChatInstance()

  return (
    <div
      onClick={() => {
        const event = {
          target: { value: suggestion },
          preventDefault: () => {},
        } as React.ChangeEvent<HTMLTextAreaElement>

        onInputChange(event)
        setTimeout(() => buttonSubmitRef?.current?.click(), 250)
      }}
      className="flex h-28 cursor-pointer items-center justify-center rounded-lg border border-input bg-card p-2.5 text-center text-sm shadow-md hover:bg-accent"
    >
      {suggestion}
    </div>
  )
}
