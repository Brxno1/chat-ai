import { Chat as ChatType } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'
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
  const isCurrentChat = currentChatId === chat.id

  const {
    resetChatState,
    onDeleteMessage,
    defineChatInstanceKey,
    setChatId,
    setChatIsDeleting,
  } = useChatStore()

  const { mutateAsync: deleteChatMutation, isPending: isDeleting } =
    useMutation({
      mutationKey: queryKeys.chatMutations.deleteById(chat.id),
      mutationFn: (id: string) => deleteChatById(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.chats.all })

        if (currentChatId === chat.id) {
          resetChatState()
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
      onSettled: () => {
        setChatIsDeleting(false)
      },
    })

  const handleDeleteChat = async () => {
    setChatIsDeleting(true)
    await deleteChatMutation(chat.id)

    if (currentChatId === chat.id) {
      router.push('/chat')
    }
  }

  const handleDefineChatInstanceKey = () => {
    defineChatInstanceKey(`chat-${chat.id}`)
    setChatId(chat.id)
  }

  return (
    <div
      onClick={handleDefineChatInstanceKey}
      className={cn(
        'relative flex w-full cursor-pointer items-start justify-between rounded-md border p-1 text-left hover:bg-accent',
        {
          'animate-pulse': isDeleting,
          'cursor-default bg-primary text-primary-foreground hover:bg-primary':
            isCurrentChat,
        },
      )}
    >
      <Link
        href={`/chat/${chat.id}`}
        className={cn('flex flex-1 flex-col items-start')}
      >
        <TooltipWrapper
          content={chat.title}
          side="right"
          asChild
          disabled={chat.title!.length <= 23}
        >
          <span className="text-sm">{truncateText(chat.title!, 25)}</span>
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
      </Link>
      <Button
        size="icon"
        variant="link"
        onClick={handleDeleteChat}
        disabled={isDeleting}
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2 border-none transition-all duration-300 hover:bg-accent-foreground hover:text-accent',
          {
            'bg-primary text-primary-foreground hover:bg-card hover:text-primary':
              isCurrentChat,
          },
        )}
      >
        <Trash2 size={16} />
      </Button>
    </div>
  )
}
