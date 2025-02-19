'use client'

import { PanelLeft } from 'lucide-react'

import { useSidebar } from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function SidebarTriggerComponent() {
  const { state, toggleSidebar } = useSidebar()

  if (state === 'expanded') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="ml-2 flex cursor-pointer items-center justify-center"
              onClick={() => toggleSidebar()}
            >
              <PanelLeft className="h-6 w-6" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            align="end"
            className="bg-background text-sm text-foreground"
          >
            <p>Fechar barra lateral</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return <span className="" />
}
