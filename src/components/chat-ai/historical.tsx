'use client'

import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Loader2, TextSearch, Trash, X } from 'lucide-react'
import React, { useEffect } from 'react'
import { formatDateToLocale } from '@/utils/format'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface Chat {
  id: string
  title: string
  createdAt: string
  messages: Array<{
    content: string
    role: string
  }>
}

async function fetchChats() {
  const response = await api.get('/chats')

  const data = response.data
  return data.chats || []
}

async function deleteChat(id: string) {
  const response = await api.delete(`/chats/${id}`)

  return response.data
}

async function deleteAllChats() {
  const response = await api.delete('/chats')

  return response
}

export function Historical({ disabled = false }: { disabled?: boolean }) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    data: chats = [],
    isLoading: isLoadingChats,
    refetch
  } = useQuery<Chat[]>({
    queryKey: ['chats'],
    queryFn: fetchChats,
    enabled: open && !disabled,
  })

  const { mutateAsync: deleteChatMutation } = useMutation({
    mutationFn: deleteChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    }
  })

  const { mutateAsync: deleteAllChatsMutation, isPending: isDeletingAllChats } = useMutation({
    mutationFn: deleteAllChats,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      setOpen(false)
    }
  })

  useEffect(() => {
    if (open && !disabled) {
      refetch()
    }
  }, [open, disabled, refetch])

  const handleOpenChat = (chatId: string) => {
    router.push(`/chat/${chatId}`)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" size="icon" disabled={disabled}>
          <TextSearch size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] space-y-2 py-4">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Histórico de Conversas</DialogTitle>
          <DialogClose asChild>
            <Button variant="link" size="icon">
              <X size={16} />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="flex flex-col overflow-y-auto max-h-[55vh] pr-4 space-y-2">
          {chats.map((chat) => (
            <MessageItem
              key={chat.id}
              chat={chat}
              onDeleteChat={deleteChatMutation}
              onOpenChat={handleOpenChat}
            />
          ))}
        </div>
        {chats.length > 0 && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => deleteAllChatsMutation()}
              disabled={isDeletingAllChats}
              className='border font-semibold text-red-600 hover:border hover:border-red-600 hover:bg-transparent hover:text-red-600'
            >
              {isDeletingAllChats ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <Trash size={16} className="mr-2" />
              )}
              Excluir todas as conversas
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface MessageItemProps {
  chat: Chat
  onDeleteChat: (id: string) => void
  onOpenChat: (id: string) => void
}

function MessageItem({ chat, onDeleteChat, onOpenChat }: MessageItemProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleting(true)

    setTimeout(() => {
      onDeleteChat(chat.id)
      setIsDeleting(false)
    }, 500)
  }

  return (
    <div
      key={chat.id}
      className="flex justify-between rounded-sm border border-border p-3 hover:bg-muted/40 cursor-pointer"
      onClick={() => onOpenChat(chat.id)}
    >
      <div className="flex-1 flex flex-col space-y-1">
        <p className="font-medium text-sm">{chat.title}</p>
        <p className="text-xs text-muted-foreground">{formatDateToLocale(new Date(chat.createdAt))}</p>
      </div>
      <Button
        variant="link"
        size="icon"
        className="size-8 hover:text-red-500 my-auto"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash size={14} />}
      </Button>
    </div>
  )
}