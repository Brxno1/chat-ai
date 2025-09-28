'use client'

import { motion } from 'framer-motion'
import React from 'react'

import { Button } from '@/components/ui/button'
import { useChatInstance } from '@/context/chat'
import { useChatStore } from '@/store/chat'
import { cn } from '@/utils/utils'

export function SuggestionQuestion() {
  const suggestions = useChatStore((state) => state.suggestions)
  const isLoadingSuggestions = useChatStore(
    (state) => state.isLoadingSuggestions,
  )

  if (isLoadingSuggestions) {
    return <SuggestionsSkeleton />
  }

  return (
    <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-3')}>
      {suggestions.length > 0 &&
        suggestions.map((suggestion, index) => (
          <QuestionCard key={index} suggestion={suggestion} />
        ))}
    </div>
  )
}

function QuestionCard({
  suggestion,
}: {
  suggestion: { id: string; role: 'assistant'; content: string }
}) {
  const { onInputChange, buttonSubmitRef } = useChatInstance()

  return (
    <Button
      variant="outline"
      onClick={() => {
        const event = {
          target: { value: suggestion.content },
          preventDefault: () => {},
        } as React.ChangeEvent<HTMLTextAreaElement>

        onInputChange(event)
        setTimeout(() => buttonSubmitRef?.current?.click(), 100)
      }}
      className={cn(
        'flex h-10 cursor-pointer items-center justify-center rounded-lg border border-input bg-primary/5 p-1 text-center text-sm shadow-md transition-all duration-300 hover:bg-accent',
      )}
    >
      <span className="truncate px-2">{suggestion.content}</span>
    </Button>
  )
}

function SuggestionsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <motion.div
          key={index}
          className="flex h-10 animate-pulse items-center justify-center rounded-lg border border-input bg-primary/5 text-center text-xs shadow-md md:text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <span className="text-muted-foreground">Gerando sugestões...</span>
        </motion.div>
      ))}
    </div>
  )
}
