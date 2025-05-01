'use client'

import { useChat } from '@ai-sdk/react'
import { ArrowUp, CircleStop, UserPlus, X } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { ComponentSwitchTheme } from '@/components/switch-theme'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSessionStore } from '@/store/user-store'
import { cn } from '@/utils/utils'

import { ChatHeader } from './header'
import { MessageChat } from './message'

interface ChatProps {
  modelName: string
}

export function Chat({ modelName }: ChatProps) {
  const { user } = useSessionStore()

  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

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
        'grid h-full w-full max-w-xl flex-col border border-border',
        {
          'grid-rows-[3rem_2rem__1fr_auto]': !closeInfoMessage,
          'grid-rows-[3rem_1fr_auto]': closeInfoMessage,
        },
      )}
    >
      <header className="sticky top-0 flex h-fit items-center justify-end border-b border-border bg-background p-3">
        {user ? (
          <ChatHeader user={user} />
        ) : (
          <div className="flex w-full items-center justify-between px-2">
            <ComponentSwitchTheme />
            <Link
              href="/auth"
              className="flex items-center justify-center gap-2 text-xs font-medium"
            >
              <Button variant={'secondary'}>
                <UserPlus className="size-5" />
                Entrar
              </Button>
            </Link>
          </div>
        )}
      </header>
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
          <X className="size-4" />
        </span>
      </div>
      <div
        ref={containerRef}
        className="flex flex-col gap-3 overflow-y-auto p-4"
      >
        {messages.map((message) => (
          <MessageChat
            key={message.id}
            message={message}
            modelName={modelName}
            onDeleteMessageChat={onDeleteMessageChat}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid w-full grid-cols-[1fr_auto] items-center justify-center gap-4 border-t border-border bg-muted/20 p-4 pt-4"
      >
        <Input
          className="placeholder:text-xs placeholder:text-muted-foreground"
          value={input}
          placeholder={'Digite sua mensagem...'}
          onChange={handleInputChange}
          ref={inputRef}
        />
        {status === 'streaming' ? (
          <Button
            type="button"
            size={'icon'}
            onClick={() => stop()}
            className="flex items-center justify-center rounded-full"
          >
            <CircleStop className="size-4" />
          </Button>
        ) : (
          <Button
            className="flex items-center justify-center rounded-full bg-muted text-muted-foreground"
            type="submit"
            variant={'outline'}
            size={'icon'}
            onClick={() =>
              containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
            }
          >
            <ArrowUp className="size-4" />
          </Button>
        )}
      </form>
    </div>
  )
}
