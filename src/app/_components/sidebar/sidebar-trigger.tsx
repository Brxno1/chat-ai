'use client'

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { Button, ButtonProps } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { TooltipWrapper } from '@/components/tooltip-wrapper'

interface SidebarTriggerComponentProps {
  className?: string
  size?: ButtonProps['size']
  variant: ButtonProps['variant']
  side?: 'left' | 'right' | 'top' | 'bottom' | undefined
  sideOffset?: number
}

export function SidebarTriggerComponent({
  variant = 'default',
  className,
  size = 'default',
  side = 'right',
  sideOffset,
}: SidebarTriggerComponentProps) {
  const { toggleSidebar, open } = useSidebar()

  return (
    <TooltipWrapper
      content={open ? 'Fechar' : 'Abrir'}
      side={side}
      sideOffset={sideOffset}
      asChild
    >
      <Button
        variant={variant}
        className={className}
        onClick={toggleSidebar}
        size={size}
      >
        {open ? (
          <PanelLeftClose className="size-8" />
        ) : (
          <PanelLeftOpen className="size-8" />
        )}
      </Button>
    </TooltipWrapper>
  )
}
