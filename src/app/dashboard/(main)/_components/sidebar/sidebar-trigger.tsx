'use client'

import { PanelLeftClose } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function SidebarTriggerComponent({ text }: { text: string }) {
  const { toggleSidebar } = useSidebar()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center justify-center"
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
