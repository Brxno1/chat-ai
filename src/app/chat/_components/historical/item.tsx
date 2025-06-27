import { Chat } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { deleteChatById } from '@/app/(http)/chat/delete-chat'
import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { queryKeys } from '@/lib/query-client'
import { useChatStore } from '@/store/chat-store'
import { formatDateToLocale, formatDistanceToNow } from '@/utils/format'
import { cn } from '@/utils/utils'

type HistoricalItemProps = {
  chat: Chat
  isLoading?: boolean
}

export function HistoricalItem({ chat }: HistoricalItemProps) {
  const queryClient = useQueryClient()

  const router = useRouter()
  const { chatId: currentChatId } = useParams()
  const isCurrentChat = currentChatId === chat.id

  const { resetChatState, onDeleteMessage, defineChatInstanceKey, setChatId } =
    useChatStore()

  const { mutateAsync: deleteChatMutation } = useMutation({
    mutationKey: queryKeys.chatMutations.deleteById(chat.id),
    mutationFn: deleteChatById,

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.chats.all })

      const previousChats = queryClient.getQueryData<Chat[]>(
        queryKeys.chats.all,
      )

      queryClient.setQueryData<Chat[]>(
        queryKeys.chats.all,
        (old: Chat[] | undefined) => {
          return old?.filter((c: Chat) => c.id !== chat.id)
        },
      )

      return { previousChats }
    },
    onSuccess: () => {
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
    onError: (_error: Error, _variables, context) => {
      if (context?.previousChats) {
        queryClient.setQueryData(queryKeys.chats.all, context.previousChats)
      }

      toast('Erro ao excluir conversa', {
        position: 'top-center',
        duration: 1500,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.all })
    },
  })

  const handleDefineChatInstanceKey = () => {
    defineChatInstanceKey(chat.id)
    setChatId(chat.id)
  }

  const handleDeleteChat = async () => {
    await deleteChatMutation(chat.id)
  }

  return (
    <Badge
      onClick={handleDefineChatInstanceKey}
      variant={'chat'}
      className={cn(
        'relative flex w-full cursor-pointer items-start justify-between rounded-md border border-input p-1 text-left transition-all duration-300',
        {
          'cursor-default bg-primary/15 hover:bg-primary/10': isCurrentChat,
        },
      )}
    >
      <Link
        href={`/chat/${chat.id}`}
        className={cn('flex flex-1 flex-col items-start', {
          'cursor-default': isCurrentChat,
        })}
      >
        <TooltipWrapper
          content={chat.title}
          side="right"
          asChild
          disabled={chat.title!.length <= 28}
        >
          <span
            className={cn('max-w-[10.5rem] truncate text-xs', {
              'text-accent-foreground': isCurrentChat,
            })}
          >
            {chat.title}
          </span>
        </TooltipWrapper>
        <TooltipWrapper
          content={formatDateToLocale(new Date(chat.createdAt))}
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
        className="absolute right-2 top-1/2 -translate-y-1/2 border-none transition-all duration-300 hover:bg-background"
      >
        <Trash2 size={16} />
      </Button>
    </Badge>
  )
}
