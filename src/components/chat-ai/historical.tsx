'use client'

import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Loader2, TextSearch, Trash, X } from 'lucide-react'
import React from 'react'
import { formatDateToLocale } from '@/utils/format'

export function Historical({ disabled = false }: { disabled?: boolean }) {
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState([
    {
      id: '1',
      content: 'Como criar uma API REST com Node.js?',
      date: '2023-11-20T14:30:00'
    },
    {
      id: '2',
      content: 'Quais são os melhores frameworks React em 2024?',
      date: '2023-11-18T09:15:00'
    },
    {
      id: '3',
      content: 'Me ajude a otimizar meu código SQL para consultas mais rápidas',
      date: '2023-11-15T16:45:00'
    },
    {
      id: '4',
      content: 'Explique como implementar autenticação JWT em uma aplicação fullstack',
      date: '2023-11-10T11:20:00'
    },
    {
      id: '5',
      content: 'Quais são as melhores práticas para deploy de microsserviços?',
      date: '2025-11-05T08:30:00'
    },
    {
      id: '6',
      content: 'Como posso melhorar a performance de minha aplicação?',
      date: '2025-11-02T12:45:00'
    },
    {
      id: '7',
      content: 'Como posso melhorar a performance de minha aplicação?',
      date: '2025-11-02T12:45:00'
    },
    {
      id: '8',
      content: 'Como posso melhorar a performance de minha aplicação?',
      date: '2025-11-02T12:45:00'
    },
    {
      id: '9',
      content: 'Como posso melhorar a performance de minha aplicação?',
      date: '2025-11-02T12:45:00'
    },
    {
      id: '10',
      content: 'Como posso melhorar a performance de minha aplicação?',
      date: '2025-11-02T12:45:00'
    },
    {
      id: '11',
      content: 'Como posso melhorar a performance de minha aplicação?',
      date: '2025-11-02T12:45:00'
    },
    {
      id: '12',
      content: 'Como posso melhorar a performance de minha aplicação?',
      date: '2025-11-02T12:45:00'
    }
  ])

  const handleDeleteMessage = (id: string) => {
    setMessages((prevMessages) => prevMessages.filter((message) => message.id !== id))
  }

  const handleDeleteAllMessages = () => {
    setMessages([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" size="icon" disabled={disabled}>
          <TextSearch size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] space-y-2 p-4">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Histórico de Conversas</DialogTitle>
          <DialogClose asChild>
            <Button variant="link">
              <X size={16} />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="flex flex-col overflow-y-auto max-h-[55vh] pr-4 space-y-2">
          {messages.length > 0 ? messages.map((message) => (
            <MessageItem key={message.id} message={message} onDeleteMessage={handleDeleteMessage} />
          )) : (
            <p className="text-sm text-center text-muted-foreground">Nenhuma conversa encontrada</p>
          )}
        </div>
        {messages.length > 0 && (
          <DialogFooter>
            <Button variant="secondary" onClick={handleDeleteAllMessages}>
              <Trash size={16} />
              Excluir todas as conversas
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface MessageProps {
  message: {
    id: string
    content: string
    date: string
  }
  onDeleteMessage: (id: string) => void
}

function MessageItem({ message, onDeleteMessage }: MessageProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleDelete = () => {
    setIsLoading(true)

    setTimeout(() => {
      onDeleteMessage(message.id)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div
      key={message.id}
      className="flex justify-between rounded-sm border border-border p-3 hover:bg-muted/40 cursor-pointer"
    >
      <div className="flex-1 flex flex-col space-y-1">
        <p className="font-medium text-sm">{message.content}</p>
        <p className="text-xs text-muted-foreground">{formatDateToLocale(new Date(message.date))}</p>
      </div>
      <Button variant="link" size="icon" className="size-8 hover:text-red-500 my-auto" onClick={handleDelete}>
        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash size={14} />}
      </Button>
    </div>
  )
}