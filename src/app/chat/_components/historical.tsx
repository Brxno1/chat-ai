'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { ChevronRight, History, RefreshCcw } from 'lucide-react'
import React from 'react'

import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useUser } from '@/context/user-provider'
import { queryKeys } from '@/lib/query-client'
import { cn } from '@/utils/utils'

import { HistoricalItem } from './historical/item'

function Historical() {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const { refreshChats, chats: initialData } = useUser()

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
    await refetch()
  }

  return (
    <Collapsible
      open={isCollapsed}
      onOpenChange={setIsCollapsed}
      className="group/collapsible flex h-full flex-col"
      data-collapsed={isCollapsed ? 'open' : 'closed'}
    >
      <div className="mb-1 flex w-full items-center justify-center gap-2">
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="relative w-full justify-start rounded-md transition-all group-data-[sidebar=closed]/sidebar:hidden"
          >
            <History size={16} />
            Histórico
            <ChevronRight className="absolute right-2 transition-all duration-300 animate-in group-data-[collapsed=open]/collapsible:rotate-90" />
          </Button>
        </CollapsibleTrigger>
        <TooltipWrapper content="Atualizar histórico" side="right" asChild>
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-accent group-data-[collapsed=closed]/collapsible:hidden group-data-[sidebar=closed]/sidebar:hidden"
            disabled={isFetching || chats.length === 0}
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
      <CollapsibleContent className="w-full items-center space-y-2 overflow-y-auto rounded-md bg-background p-1.5 text-center scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-full hover:scrollbar-thumb-gray-400/80 group-data-[collapsed=closed]/collapsible:hidden group-data-[sidebar=closed]/sidebar:hidden group-data-[collapsed=open]/collapsible:border">
        {chats.length > 0 ? (
          chats?.map((chat) => (
            <HistoricalItem key={chat.id} chat={chat} isLoading={isFetching} />
          ))
        ) : (
          <span className="text-xs text-muted-foreground">
            Você ainda não possui nenhum chat
          </span>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

export { Historical }
