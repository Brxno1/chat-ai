import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'

import { deleteChatById } from '@/app/(http)/chat/delete-chat'
import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useChatInstance } from '@/context/chat'
import { queryKeys } from '@/lib/query-client'
import { Chat } from '@/services/database/generated'
import { useChatStore } from '@/store/chat'
import { formatDateToLocale, formatDistanceToNow } from '@/utils/format'
import { cn } from '@/utils/utils'

type HistoricalItemProps = {
  chat: Chat
  isLoading?: boolean
}

export function HistoricalItem({ chat }: HistoricalItemProps) {
  const queryClient = useQueryClient()
  const { setMessages } = useChatInstance()

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

      const isCurrentChat = currentChatId === chat.id

      const previousChatState = isCurrentChat
        ? queryClient.getQueryData(queryKeys.chats.detail(chat.id))
        : undefined

      queryClient.setQueryData<Chat[]>(
        queryKeys.chats.all,
        (old: Chat[] | undefined) => {
          return old?.filter((c: Chat) => c.id !== chat.id)
        },
      )

      if (isCurrentChat) {
        resetChatState()
        router.push('/')
        return { previousChats, isCurrentChat, previousChatState }
      }

      return { previousChats, isCurrentChat, previousChatState }
    },
    onSuccess: () => {
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

      if (context?.isCurrentChat && context?.previousChatState) {
        queryClient.setQueryData(
          queryKeys.chats.detail(chat.id),
          context.previousChatState,
        )

        router.push(`/chat/${chat.id}`)
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

  const handleNavigateToConversation = () => {
    if (isCurrentChat) return

    defineChatInstanceKey(chat.id)
    setChatId(chat.id)
  }

  const handleDeleteChat = async () => {
    if (isCurrentChat) {
      setMessages([])
    }
    await deleteChatMutation(chat.id)
  }

  const formattedFullDate = React.useMemo(() => {
    return formatDateToLocale(new Date(chat.createdAt))
  }, [chat.createdAt])

  const formattedDistanceDate = React.useMemo(() => {
    return formatDistanceToNow(new Date(chat.createdAt))
  }, [chat.createdAt])

  return (
    <Badge
      variant={'chat'}
      className={cn(
        'relative flex cursor-pointer items-start justify-between rounded-md border border-input bg-card p-1 text-left transition-all duration-300 hover:bg-accent',
        {
          'cursor-default bg-primary/15 hover:bg-primary/10': isCurrentChat,
        },
      )}
    >
      <Link
        href={`/chat/${chat.id}`}
        onClick={handleNavigateToConversation}
        prefetch
        className={cn('flex w-full flex-col items-start', {
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
            className={cn('max-w-[81%] truncate text-xs', {
              'text-accent-foreground': isCurrentChat,
            })}
          >
            {chat.title}
          </span>
        </TooltipWrapper>
        <TooltipWrapper content={formattedFullDate} side="right" asChild>
          <span className="text-2xs text-muted-foreground">
            {formattedDistanceDate}
          </span>
        </TooltipWrapper>
      </Link>
      <Button
        size="icon"
        variant="link"
        onClick={handleDeleteChat}
        className="absolute right-1 top-1/2 -translate-y-1/2 border-none transition-all duration-300 hover:bg-background"
      >
        <Trash2 size={16} />
      </Button>
    </Badge>
  )
}
