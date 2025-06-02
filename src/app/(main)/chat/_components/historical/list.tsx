import { useSuspenseQuery } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'

import { fetchChats } from '@/app/(http)/chat/get-chats'
import { ChatResponse } from '@/app/api/chats/route'
import { ContainerWrapper } from '@/components/container'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { HistoricalItem } from './item'

type HistoricalListProps = {
  onOpenChatWithId: (id: string) => void
}

function HistoricalList({ onOpenChatWithId }: HistoricalListProps) {
  const { data } = useSuspenseQuery<ChatResponse>({
    queryFn: fetchChats,
    queryKey: ['chats'],
  })

  if (!data.chats || data.chats.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">
        Você ainda não tem nenhum chat
      </span>
    )
  }

  return (
    <>
      {data.chats.map((chat) => (
        <HistoricalItem
          key={chat.id}
          chat={chat}
          onOpenChatWithId={onOpenChatWithId}
        />
      ))}
    </>
  )
}

function HistoricalListSkeleton() {
  const skeletonSize = [
    'h-3 w-36',
    'h-3 w-16',
    'h-3 w-20',
    'h-3 w-32',
    'h-3 w-8',
    'h-3 w-16',
  ]

  return (
    <>
      {skeletonSize.map((size, index) => (
        <ContainerWrapper
          key={index}
          className="relative flex w-full cursor-pointer items-start justify-between rounded-md border px-2 py-2 text-left"
        >
          <div className="flex flex-col items-start gap-1.5">
            <Skeleton className={size} />
            <Skeleton className="h-2 w-12" />
          </div>
          <Button
            className="absolute right-2 top-1/2 -translate-y-1/2"
            variant="outline"
            size="icon"
            disabled
          >
            <Trash2 size={16} />
          </Button>
        </ContainerWrapper>
      ))}
    </>
  )
}

export { HistoricalList, HistoricalListSkeleton }
