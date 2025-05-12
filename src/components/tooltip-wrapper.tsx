'use client'

import { type ReactNode } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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
  disableHoverableContent = false,
}: TooltipWrapperProps) {
  if (disabled) {
    return <>{children}</>
  }

  return (
    <Tooltip delayDuration={delayDuration} disableHoverableContent={disableHoverableContent}>
      <TooltipTrigger asChild={asChild}>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} align={align} className={className}>
        {content}
      </TooltipContent>
    </Tooltip>
  )
}
