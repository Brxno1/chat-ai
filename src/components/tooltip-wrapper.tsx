'use client'

import { type ReactNode } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/utils/utils'

type TooltipWrapperProps = {
  children: ReactNode
  content: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  className?: string
  asChild?: boolean
  disabled?: boolean
  disableHoverableContent?: boolean
  sideOffset?: number
}

export function TooltipWrapper({
  children,
  content,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  className,
  asChild = false,
  disabled = false,
  disableHoverableContent = true,
  sideOffset = 5,
}: TooltipWrapperProps) {
  if (disabled) {
    return <>{children}</>
  }

  return (
    <Tooltip delayDuration={delayDuration} disableHoverableContent={disableHoverableContent}>
      <TooltipTrigger asChild={asChild}>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} align={align} sideOffset={sideOffset} className={cn(className, "bg-secondary text-secondary-foreground text-xs")}>
        {content}
      </TooltipContent>
    </Tooltip>
  )
}
