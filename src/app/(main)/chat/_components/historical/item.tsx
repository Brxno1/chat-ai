import { Chat as ChatType } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { deleteChatWithId } from '@/app/(http)/chat/delete-chat'
import { ContainerWrapper } from '@/components/container'
import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from '@/utils/format'
import { truncateText } from '@/utils/truncate-text'
import { cn } from '@/utils/utils'

type HistoricalItemProps = {
  chat: ChatType
  onOpenChatWithId: (id: string) => void
}

export function HistoricalItem({
  chat,
  onOpenChatWithId,
}: HistoricalItemProps) {
  const queryClient = useQueryClient()

  const { mutateAsync: deleteChatMutation, isPending: isDeleting } =
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

  const handleDeleteChat = async (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.stopPropagation()
    await deleteChatMutation(chat.id)
  }

  return (
    <ContainerWrapper
      role="button"
      className="relative flex w-full cursor-pointer items-start justify-between rounded-md border px-2 py-1 text-left hover:bg-accent"
      onClick={() => onOpenChatWithId(chat.id)}
    >
      <div className="flex flex-col items-start gap-1">
        <TooltipWrapper
          content={chat.title}
          side="right"
          asChild
          disabled={chat.title!.length <= 18}
        >
          <span className="text-xs">{truncateText(chat.title || '', 30)}</span>
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
        size="icon"
        variant="outline"
        onClick={handleDeleteChat}
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2 hover:bg-card',
          isDeleting && 'animate-pulse bg-destructive',
        )}
      >
        <Trash2 size={16} />
      </Button>
    </ContainerWrapper>
  )
}
