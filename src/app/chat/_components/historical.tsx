'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { ChevronRight, History, RefreshCcw } from 'lucide-react'
import React from 'react'

import { ChatWithMessages } from '@/app/api/chat/actions/get-chats'
import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { queryKeys } from '@/lib/query-client'
import { cn } from '@/utils/utils'

import { HistoricalList } from './historical/list'

function Historical({
  refreshChats,
  initialData,
}: {
  refreshChats: () => Promise<ChatWithMessages[]>
  initialData: ChatWithMessages[]
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const {
    data: chats,
    isFetching,
    refetch,
  } = useSuspenseQuery({
    queryFn: refreshChats,
    queryKey: queryKeys.chats.all,
    initialData,
  })

  const handleRefreshChats = async () => {
    setIsCollapsed(true)
    await refetch()
  }

  return (
    <Collapsible
      open={isCollapsed}
      onOpenChange={setIsCollapsed}
      className="group/collapsible flex h-full flex-col"
      data-collapsed={isCollapsed ? 'open' : 'closed'}
    >
      <div className="flex w-full items-center gap-2">
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="relative w-full justify-start rounded-md text-xs group-data-[sidebar=closed]/sidebar:hidden"
          >
            <History size={20} />
            Histórico de conversas
            <ChevronRight className="absolute right-2 transition-all duration-300 animate-in group-data-[collapsed=open]/collapsible:rotate-90" />
          </Button>
        </CollapsibleTrigger>
        <TooltipWrapper content="Atualizar histórico" side="right" asChild>
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-accent group-data-[sidebar=closed]/sidebar:hidden"
            onClick={handleRefreshChats}
          >
            <RefreshCcw
              size={16}
              className={cn({
                'animate-spin': isFetching,
              })}
            />
          </Button>
        </TooltipWrapper>
      </div>
      <CollapsibleContent className="mt-2 w-full items-center space-y-2 overflow-y-auto rounded-md bg-background px-1.5 py-2 text-center scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-full hover:scrollbar-thumb-gray-300/80 group-data-[collapsed=closed]/collapsible:hidden group-data-[sidebar=closed]/sidebar:hidden group-data-[collapsed=open]/collapsible:border">
        <HistoricalList chats={chats!} isLoading={isFetching} />
      </CollapsibleContent>
    </Collapsible>
  )
}

export { Historical }
