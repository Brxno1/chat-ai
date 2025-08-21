'use client'

import { SuggestionCard } from './suggestion-cards'

export function SuggestionCards() {
  const suggestions = [
    'Qual a melhor forma de economizar dinheiro?',
    'Qual a melhor forma de investir?',
    'Como está o clima em São Paulo?',
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {suggestions.map((suggestion, index) => (
        <SuggestionCard key={index} text={suggestion} />
      ))}
    </div>
  )
}
