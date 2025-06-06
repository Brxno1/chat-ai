import { Trash2 } from 'lucide-react'

import { ChatWithMessages } from '@/app/api/chat/actions/get-chats'
import { ContainerWrapper } from '@/components/container'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { HistoricalItem } from './item'

type HistoficalListProps = {
  chats: ChatWithMessages[]
  isLoading: boolean
}

function HistoricalList({ chats, isLoading }: HistoficalListProps) {
  if (isLoading) {
    return <HistoricalListSkeleton />
  }

  if (!chats || chats.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">
        Você ainda não possui nenhum chat
      </span>
    )
  }

  return (
    <>
      {chats.map((chat) => (
        <HistoricalItem key={chat.id} chat={chat} />
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
    'h-3 w-36',
  ]

  return (
    <>
      {skeletonSize.map((size, index) => (
        <ContainerWrapper
          key={index}
          className="relative flex w-full cursor-pointer items-start justify-between rounded-md border text-left"
        >
          <div className="flex flex-col items-start gap-2 p-2">
            <Skeleton className={size} />
            <Skeleton className="h-2 w-12" />
          </div>
          <Button
            className="absolute right-2 top-1/2 -translate-y-1/2 border-none"
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
