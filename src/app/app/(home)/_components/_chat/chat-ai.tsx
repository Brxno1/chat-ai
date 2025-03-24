'use client'

import { useChat } from '@ai-sdk/react'
import { ArrowRight, ArrowUp, CircleStop, UserPlus, X } from 'lucide-react'
import Link from 'next/link'
import { Session } from 'next-auth'
import * as React from 'react'

import { ComponentSwitchTheme } from '@/components/switch-theme'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/utils'

import { MessageChat } from './message'

interface ChatProps {
  modelName: string
  placeholder?: string
  user: Session['user'] | undefined
}

export function Chat({
  modelName,
  user,
  placeholder = 'Digite sua mensagem...',
}: ChatProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const [open, setOpen] = React.useState(false)

  const [closeInfoMessage, setCloseInfoMessage] = React.useState<boolean>(
    () => {
      if (typeof window !== 'undefined') {
        const close = localStorage.getItem('close-info-message')
        return close ? JSON.parse(close) : false
      }
      return false
    },
  )

  const {
    messages,
    input,
    status,
    setMessages,
    handleInputChange,
    handleSubmit,
    stop,
  } = useChat({
    api: '/api/chat',
    body: {
      name: user?.name ?? '',
      locale: navigator.language,
    },
  })

  const onDeleteMessageChat = (id: string) => {
    setMessages((prevMessages) =>
      prevMessages.filter((message) => message.id !== id),
    )
  }

  const handleCloseInfoMessage = () => {
    setCloseInfoMessage(true)
    localStorage.setItem('close-info-message', JSON.stringify(true))
  }

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    inputRef.current?.focus()
  }, [messages])

  return (
    <div
      className={cn(
        'mx-auto grid h-full w-full max-w-2xl flex-col border border-border px-1',
        {
          'grid-rows-[3rem_2rem__1fr_auto]': !closeInfoMessage,
          'grid-rows-[3rem_1fr_auto]': closeInfoMessage,
        },
      )}
    >
      <div className="flex h-fit items-center justify-end border-b border-border p-3">
        {!user && (
          <Link href="/auth">
            <UserPlus className="h-5 w-5" />
          </Link>
        )}
        <div className="flex items-center gap-4">
          {user && (
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-grab rounded-sm">
                  <AvatarImage src={user.image as string} alt="user avatar" />
                  <AvatarFallback className="rounded-none">
                    {user?.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex text-xs text-muted-foreground">
                  <span>{user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link
                    href="/app"
                    className="flex w-full items-center justify-center gap-2 text-xs"
                  >
                    Acessar App
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-center">
                  <ComponentSwitchTheme />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <div
        className="mt-2 flex items-center justify-around rounded-b-md bg-muted data-[close=true]:hidden"
        data-close={closeInfoMessage}
      >
        <p className="text-xs text-muted-foreground">
          Modelo atual:{' '}
          <span className="font-bold text-foreground">{modelName}</span> - Este
          é um modelo de IA de 2023, utilizado apenas para fins de estudos e
          testes.
        </p>
        <span onClick={handleCloseInfoMessage} className="cursor-pointer">
          <X className="h-4 w-4" />
        </span>
      </div>
      <div
        ref={containerRef}
        className="flex flex-col gap-4 overflow-y-auto px-4 py-6"
      >
        {messages.map((message) => (
          <MessageChat
            key={message.id}
            message={message}
            modelName={modelName}
            user={user}
            onDeleteMessageChat={onDeleteMessageChat}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid w-full grid-cols-[1fr_4rem] items-center justify-center gap-2 border-t border-border p-4 pt-4"
      >
        <Input
          className="rounded border border-zinc-300 p-2 drop-shadow-md placeholder:text-sm placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900"
          value={input}
          placeholder={placeholder?.replace(/"/g, '')}
          onChange={handleInputChange}
          ref={inputRef}
        />
        {status === 'streaming' && (
          <Button
            type="button"
            size={'icon'}
            onClick={stop}
            className="flex items-center justify-center rounded-full"
          >
            <CircleStop className="h-4 w-4" />
          </Button>
        )}
        {status !== 'streaming' && (
          <Button
            className="mx-auto flex items-center justify-center rounded-full bg-muted text-muted-foreground drop-shadow-md"
            type="submit"
            variant={'outline'}
            size={'icon'}
            onClick={() =>
              containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
            }
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
      </form>
    </div>
  )
}
