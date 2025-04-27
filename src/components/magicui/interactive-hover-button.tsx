import { ArrowRight } from 'lucide-react'
import React from 'react'

import { cn } from '@/utils/utils'

import { Button } from '../ui/button'

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean
}

export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ children, className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="outline"
      className={cn(
        'group relative w-[10rem] items-center overflow-hidden rounded-full px-6 py-2 font-semibold disabled:cursor-default disabled:text-muted-foreground',
        className,
      )}
      {...props}
    >
      {props.disabled ? (
        <div className="flex items-center justify-center gap-2">
          <div className="h-2 w-2 rounded-full bg-muted-foreground" />
          <span className="inline-block">{children}</span>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-center gap-4">
            <div className="h-2 w-2 rounded-full bg-primary transition-all duration-300 group-hover:scale-[100.8]" />
            <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
              {children}
            </span>
          </div>
          <div className="absolute z-10 flex h-full items-center justify-center gap-4 text-primary-foreground opacity-0 transition-all duration-300 group-hover:opacity-100">
            <div className="ml-3 h-2 w-2 rounded-full bg-background transition-all duration-300" />
            <span className="flex items-center gap-2">
              {children}
              <ArrowRight size={16} />
            </span>
          </div>
        </div>
      )}
    </Button>
  )
})

InteractiveHoverButton.displayName = 'InteractiveHoverButton'
