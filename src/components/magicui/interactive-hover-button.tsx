import { ArrowRight } from 'lucide-react'
import React from 'react'

import { cn } from '@/utils/utils'

import { Button } from '../ui/button'

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.RefObject<HTMLButtonElement>
  disabled?: boolean
}

export const InteractiveHoverButton = ({
  ref,
  children,
  className,
  disabled,
  ...props
}: InteractiveHoverButtonProps) => {
  return (
    <Button
      ref={ref}
      {...props}
      disabled={disabled}
      variant="outline"
      className={cn(
        'group relative items-center overflow-hidden px-5 py-2.5 font-semibold',
        className,
      )}
    >
      {disabled ? (
        <div className="flex items-center justify-center gap-2">
          <div className="size-2 rounded-full bg-muted-foreground" />
          <span className="inline-block">{children}</span>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-center gap-2">
            <div className="size-2 rounded-full bg-primary transition-all duration-300 group-hover:scale-[100.8]" />
            <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
              {children}
            </span>
          </div>
          <div className="absolute z-10 flex items-center justify-center gap-4 text-primary-foreground opacity-0 transition-all duration-300 group-hover:opacity-100">
            <div className="ml-1.5 size-2 rounded-full bg-background transition-all duration-300" />
            <span className="flex items-center gap-2">
              {children}
            </span>
          </div>
        </div>
      )}
    </Button>
  )
}

InteractiveHoverButton.displayName = 'InteractiveHoverButton'
