'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { AlignLeft, ChevronRight } from 'lucide-react'
import React from 'react'

import { fetchChats } from '@/app/(http)/chat/fetch-chats'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useSessionUser } from '@/context/user'
import { queryKeys } from '@/lib/query-client'
import { Chat } from '@/services/database/generated'
import { groupItemsByDate } from '@/utils/format'

import { HistoricalItem } from './item'

function Historical() {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const { chats: initialData } = useSessionUser()

  const { data: chats, isFetching } = useSuspenseQuery({
    queryFn: fetchChats,
    queryKey: queryKeys.chats.all,
    initialData,
  })

  const groupedChats = React.useMemo(() => {
    return groupItemsByDate<Chat>(chats, (chat) => new Date(chat.createdAt))
  }, [chats])

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
            variant="ghost"
            className="relative w-full justify-between rounded-md transition-all group-data-[sidebar=closed]/sidebar:hidden"
          >
            <span className="flex items-center gap-2">
              <AlignLeft size={16} />
              Histórico
            </span>
            <ChevronRight className="transition-all duration-300 animate-in group-data-[collapsed=open]/collapsible:rotate-90" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="w-full items-center space-y-1.5 overflow-y-auto rounded-md bg-background p-1.5 text-center scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-full hover:scrollbar-thumb-gray-400/80 group-data-[collapsed=closed]/collapsible:hidden group-data-[sidebar=closed]/sidebar:hidden group-data-[collapsed=open]/collapsible:border group-data-[collapsed=open]/collapsible:border-input">
        {chats.length > 0 ? (
          groupedChats.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <div className="text-left text-sm font-medium text-muted-foreground">
                {group.title}
              </div>
              {group.items.map((chat) => (
                <HistoricalItem
                  key={chat.id}
                  chat={chat}
                  isLoading={isFetching}
                />
              ))}
            </div>
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
