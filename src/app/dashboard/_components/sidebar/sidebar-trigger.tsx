'use client'

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { Button, ButtonProps } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SidebarTriggerComponentProps {
  className?: string
  size?: ButtonProps['size']
  variant: ButtonProps['variant']
  side?: 'left' | 'right' | 'top' | 'bottom' | undefined
}

export function SidebarTriggerComponent({
  variant = 'default',
  className,
  size = 'default',
  side = 'right',
}: SidebarTriggerComponentProps) {
  const { toggleSidebar, open } = useSidebar()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
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
      </TooltipTrigger>
      <TooltipContent side={side}>
        <p>{open ? 'Fechar' : 'Abrir'}</p>
      </TooltipContent>
    </Tooltip>
  )
}
