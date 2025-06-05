import { Chat as ChatType } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { deleteChatById } from '@/app/(http)/chat/delete-chat'
import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { Button } from '@/components/ui/button'
import { queryKeys } from '@/lib/query-client'
import { useChatStore } from '@/store/chat-store'
import { formatDistanceToNow } from '@/utils/format'
import { truncateText } from '@/utils/truncate-text'
import { cn } from '@/utils/utils'

type HistoricalItemProps = {
  chat: ChatType
}

export function HistoricalItem({ chat }: HistoricalItemProps) {
  const queryClient = useQueryClient()

  const router = useRouter()
  const { chatId: currentChatId } = useParams()

  const {
    chatId,
    setChatId,
    resetChatState,
    onDeleteMessage,
    resetChatInstance,
  } = useChatStore()

  const { mutateAsync: deleteChatMutation, isPending: isDeleting } =
    useMutation({
      mutationKey: queryKeys.chatMutations.deleteById(chat.id),
      mutationFn: (id: string) => deleteChatById(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.chats.all })

        if (chatId === chat.id) {
          resetChatState()
          resetChatInstance()
          router.push('/chat')
        }

        onDeleteMessage(chat.id)
        toast('Conversa excluída', {
          position: 'top-center',
          duration: 1500,
        })
      },
      onError: (error: Error) => {
        console.log(error.message, 'error')
        toast('Erro ao excluir conversa', {
          position: 'top-center',
          duration: 1500,
        })
      },
    })

  const handleDeleteChat = async (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.stopPropagation()

    await deleteChatMutation(chat.id)

    if (chatId === chat.id) {
      router.push('/chat')
    }
  }

  const handleOpenChat = () => {
    setChatId(chat.id)
    router.push(`/chat/${chat.id}`)
  }

  const isCurrentChat = currentChatId === chat.id

  return (
    <div
      onClick={handleOpenChat}
      className={cn(
        'relative flex w-full cursor-pointer items-start justify-between rounded-md border px-2 py-1 text-left hover:bg-accent',
        isDeleting && 'animate-pulse',
        isCurrentChat &&
          'cursor-default bg-primary text-primary-foreground hover:bg-primary/90',
      )}
    >
      <div className="flex flex-col items-start">
        <TooltipWrapper
          content={chat.title}
          side="right"
          asChild
          disabled={chat.title!.length <= 18}
        >
          <span className="text-sm">{truncateText(chat.title!, 35)}</span>
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
        variant="ghost"
        onClick={handleDeleteChat}
        disabled={isDeleting}
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2 border-none hover:bg-card',
          isDeleting && 'cursor-not-allowed',
        )}
      >
        <Trash2 size={16} />
      </Button>
    </div>
  )
}
