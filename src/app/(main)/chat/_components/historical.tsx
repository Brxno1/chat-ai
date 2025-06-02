'use client'

import { ChevronRight, History, RefreshCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { Suspense } from 'react'

import { TooltipWrapper } from '@/components/tooltip-wrapper'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useSessionStore } from '@/store/user-store'

import { Button } from '../../../../components/ui/button'
import { HistoricalItem, HistoricalItemSkeleton } from './historical-item'

type HistoricalProps = {
  disabled?: boolean
  pathname: string
}

export function Historical({ pathname }: HistoricalProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const router = useRouter()

  const { user } = useSessionStore()

  const handleOpenChat = (chatId: string) => {
    router.push(`/chat/${chatId}`)
  }

  if (!user) return null

  return (
    <Collapsible
      open={isCollapsed}
      onOpenChange={setIsCollapsed}
      className="group/collapsible flex h-full flex-col"
      data-collapsed={isCollapsed ? 'open' : 'closed'}
      data-pathname={
        pathname === '/dashboard' || pathname === '/dashboard/settings'
      }
    >
      <div className="flex w-full items-center gap-2">
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="relative w-full justify-start rounded-md text-sm group-data-[pathname=true]/collapsible:hidden group-data-[sidebar=closed]/sidebar:hidden"
          >
            <History size={20} />
            Histórico
            <ChevronRight className="absolute right-4 transition-all duration-300 animate-in group-data-[collapsed=open]/collapsible:rotate-90" />
          </Button>
        </CollapsibleTrigger>
        <TooltipWrapper content="Atualizar histórico" side="right" asChild>
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-accent group-data-[pathname=true]/collapsible:hidden group-data-[sidebar=closed]/sidebar:hidden"
          >
            <RefreshCcw size={16} />
          </Button>
        </TooltipWrapper>
      </div>
      <CollapsibleContent className="mt-2 space-y-2 overflow-y-auto rounded-md bg-background px-1.5 py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-full hover:scrollbar-thumb-gray-300/80 group-data-[collapsed=closed]/collapsible:hidden group-data-[pathname=true]/collapsible:hidden group-data-[sidebar=closed]/sidebar:hidden group-data-[collapsed=open]/collapsible:border">
        <Suspense fallback={<HistoricalItemSkeleton />}>
          <HistoricalItem onOpen={handleOpenChat} />
        </Suspense>
      </CollapsibleContent>
    </Collapsible>
  )
}
