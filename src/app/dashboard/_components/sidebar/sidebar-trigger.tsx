'use client'

import { PanelLeftClose } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function SidebarTriggerComponent() {
  const { open, toggleSidebar } = useSidebar()

  if (open) {
    return (
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 flex cursor-pointer items-center justify-center"
            onClick={() => toggleSidebar()}
          >
            <PanelLeftClose className="size-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent align="end" className="text-sm">
          <p>Fechar</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return <span className="" />
}
