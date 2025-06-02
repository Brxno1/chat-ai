import { Chat } from '@prisma/client'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { deleteChatWithId } from '@/app/(http)/chat/delete-chat'
import { fetchChats } from '@/app/(http)/chat/get-chats'
import { ContainerWrapper } from '@/components/container'
import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { truncateText } from '@/utils/truncate-text'
import { cn } from '@/utils/utils'

type ChatItemProps = {
  onOpen: (id: string) => void
}

export function HistoricalItem({ onOpen }: ChatItemProps) {
  const queryClient = useQueryClient()

  const { data: chats = [] } = useSuspenseQuery<Chat[]>({
    queryFn: fetchChats,
    queryKey: ['chats'],
  })

  const { mutateAsync: deleteChatMutation, isPending: isDeletingChat } =
    useMutation({
      mutationFn: deleteChatWithId,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chats'] })
        toast('Chat deletado com sucesso', {
          position: 'top-center',
          duration: 1500,
        })
      },
    })

  const handleDeleteChat = async (
    ev: React.MouseEvent<HTMLButtonElement>,
    id: string,
  ) => {
    ev.stopPropagation()
    await deleteChatMutation(id)
  }

  const handleOpenChat = (id: string) => {
    onOpen(id)
  }

  return (
    <>
      {chats.map((chat, index) => (
        <ContainerWrapper
          role="button"
          className="relative flex w-full cursor-pointer items-start justify-between rounded-md border px-2 py-1 text-left hover:bg-accent"
          key={index}
          onClick={() => handleOpenChat(chat.id)}
        >
          <div className="flex flex-col items-start gap-1">
            <TooltipWrapper
              content={chat.title}
              side="right"
              asChild
              disabled={chat.title!.length <= 18}
            >
              <span className="text-xs">{truncateText(chat.title!, 30)}</span>
            </TooltipWrapper>
            <TooltipWrapper
              content={new Date(chat.createdAt).toLocaleString()}
              side="right"
              asChild
            >
              <span className="text-2xs text-muted-foreground">
                {formatDistanceToNow(new Date(chat.createdAt))}
              </span>
            </TooltipWrapper>
          </div>
          <Button
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 hover:bg-card',
              isDeletingChat && 'animate-pulse',
            )}
            variant="outline"
            size="icon"
            onClick={(ev) => handleDeleteChat(ev, chat.id)}
            disabled={isDeletingChat}
          >
            <Trash2 size={20} />
          </Button>
        </ContainerWrapper>
      ))}
    </>
  )
}

export function HistoricalItemSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <ContainerWrapper
          key={index}
          className="relative flex w-full cursor-pointer items-start justify-between rounded-md border px-2 py-1 text-left"
        >
          <div className="flex flex-col items-start gap-2">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-2 w-12" />
          </div>
          <Button
            className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-card"
            variant="outline"
            size="icon"
            disabled
          >
            <Trash2 size={20} className="text-muted-foreground" />
          </Button>
        </ContainerWrapper>
      ))}
    </>
  )
}
