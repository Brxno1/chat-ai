'use client'

import { PanelLeftClose } from 'lucide-react'

import { useSidebar } from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function SidebarTriggerComponent() {
  const { state, toggleSidebar } = useSidebar()

  if (state === 'expanded') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="ml-2 flex cursor-pointer items-center justify-center"
            onClick={() => toggleSidebar()}
          >
            <PanelLeftClose className="h-6 w-6" />
          </button>
        </TooltipTrigger>
        <TooltipContent align="end" className="text-sm">
          <p>Fechar</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return <span className="" />
}
