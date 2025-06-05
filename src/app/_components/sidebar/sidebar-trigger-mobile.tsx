'use client'

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { Button, ButtonProps } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'

interface SidebarTriggerComponentMobileProps {
  className?: string
  size?: ButtonProps['size']
  variant?: ButtonProps['variant']
  side?: 'left' | 'right' | 'top' | 'bottom' | undefined
  sideOffset?: number
}

export function SidebarTriggerComponentMobile({
  variant = 'default',
  className,
  size = 'default',
  side = 'right',
  sideOffset,
}: SidebarTriggerComponentMobileProps) {
  const { openMobile, setOpenMobile, isMobile } = useSidebar()

  const handleToggleSidebar = () => {
    setOpenMobile(!openMobile)
  }

  if (!isMobile) {
    return null
  }

  return (
    <TooltipWrapper
      content={openMobile ? 'Fechar' : 'Abrir'}
      side={side}
      sideOffset={sideOffset}
      asChild
    >
      <Button
        variant={variant}
        className={className}
        onClick={handleToggleSidebar}
        size={size}
      >
        {openMobile ? (
          <PanelLeftClose className="size-8" />
        ) : (
          <PanelLeftOpen className="size-8" />
        )}
      </Button>
    </TooltipWrapper>
  )
}
