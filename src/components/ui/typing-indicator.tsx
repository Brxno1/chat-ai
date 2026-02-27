import React from 'react'

import { cn } from '@/utils/utils'

interface TypingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TypingIndicator({ className, ...props }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        'flex h-8 items-center justify-center space-x-1.5 p-4',
        className,
      )}
      {...props}
    >
      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
    </div>
  )
}
