'use client'

import { PanelLeftClose } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SidebarTriggerComponentProps {
  text: string
  className?: string
  variant?:
    | 'default'
    | 'ghost'
    | 'outline'
    | 'secondary'
    | 'destructive'
    | 'link'
}

export function SidebarTriggerComponent({
  text,
  variant = 'default',
  className,
}: SidebarTriggerComponentProps) {
  const { toggleSidebar } = useSidebar()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          className={className}
          onClick={() => toggleSidebar()}
        >
          <PanelLeftClose className="size-8" />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="end" className="text-sm font-bold">
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  )
}
