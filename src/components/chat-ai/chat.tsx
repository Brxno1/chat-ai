'use client'

import { useChat } from '@ai-sdk/react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Ghost,
  GlobeIcon, MessageCirclePlus,
  MicIcon,
  PlusIcon,
  SendIcon,
  StopCircle, UserPlus
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { ComponentSwitchTheme } from '@/components/switch-theme'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem } from '@/components/ui/form'
import {
  AIForm,
  AIInputButton,
  AIInputModelSelect,
  AIInputModelSelectContent,
  AIInputModelSelectItem,
  AIInputModelSelectTrigger,
  AIInputModelSelectValue,
  AIButtonSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from '@/components/ui/kibo-ui/ai/input'
import { useSessionStore } from '@/store/user-store'
import { cn } from '@/utils/utils'

import { ChatHeader } from './header'
import { MessageChat } from './message'
import { models } from './models'
import Image from 'next/image'
import { TypingAnimation } from '../magicui/typing-animation'
import { Historical } from './historical'
import { ContainerWrapper } from '../container'

interface ChatProps {
  modelName: string
}

const schema = z.object({
  message: z.string(),
})

export function Chat({ modelName }: ChatProps) {
  const [model, setModel] = React.useState<string>(models[0].id)
  const [isGhost, setIsGhost] = React.useState<boolean>(false)
  const { user } = useSessionStore()

  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

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

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: input,
    },
  })

  const onDeleteMessageChat = (id: string) => {
    setMessages((prevMessages) =>
      prevMessages.filter((message) => message.id !== id),
    )
  }

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    inputRef.current?.focus()
  }, [messages])

  const onSubmit = () => {
    handleSubmit()
    form.reset()
  }

  return (
    <div
      className={cn(
        'grid h-full w-full max-w-xl flex-col border border-border grid-rows-[auto__1fr_auto]',
      )}
    >
      <header className="sticky top-0 flex h-fit items-center justify-end border bg-background p-3">
        {user ? (
          <ContainerWrapper className="flex items-center justify-between w-full">
            <div className="flex gap-1">
              <Historical />
              <Button variant="link" size="icon">
                <MessageCirclePlus size={16} />
              </Button>
              <Button variant="link" size="icon" onClick={() => setIsGhost(!isGhost)}>
                <Ghost size={16} />
              </Button>
            </div>
            <ChatHeader user={user} />
          </ContainerWrapper>
        ) : (
          <div className="flex w-full items-center justify-between px-2">
            <ComponentSwitchTheme />
            <Link
              href="/auth"
              className="flex items-center justify-center gap-2 text-xs font-medium"
            >
              <Button variant="secondary">
                <UserPlus size={16} />
                Entrar
              </Button>
            </Link>
          </div>
        )}
      </header>
      <div
        ref={containerRef}
        className={cn(
          'flex flex-col gap-3 overflow-y-auto p-4',
          isGhost && 'bg-purple-950/20'
        )}
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
      <Form {...form}>
        <AIForm
          onSubmit={form.handleSubmit(onSubmit)}
          className="rounded-t-lg"
        >
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className='relative'>
                <AIInputTextarea
                  placeholder=''
                  value={field.value}
                  onChange={(ev) => {
                    field.onChange(ev)
                    handleInputChange(ev)
                  }}
                />
                {!field.value && (
                  <TypingAnimation
                    className="pointer-events-none text-xs text-muted-foreground absolute left-3 top-3"
                  >
                    Digite sua mensagem...
                  </TypingAnimation>
                )}
              </FormItem>
            )}
          />
          <AIInputToolbar className="p-2">
            <AIInputTools className="gap-2">
              <AIInputButton disabled variant={'outline'}>
                <PlusIcon size={16} />
              </AIInputButton>
              <AIInputButton disabled variant={'outline'}>
                <MicIcon size={16} />
              </AIInputButton>
              <AIInputButton disabled variant={'outline'}>
                <GlobeIcon size={16} />
                <span>Search</span>
              </AIInputButton>
              <AIInputModelSelect value={model} onValueChange={setModel}>
                <AIInputModelSelectTrigger className="flex items-center gap-2">
                  <AIInputModelSelectValue />
                </AIInputModelSelectTrigger>
                <AIInputModelSelectContent>
                  {models.map((model) => (
                    <AIInputModelSelectItem
                      key={model.id}
                      value={model.id}
                      disabled={model.disabled}
                    >
                      <Image
                        src={`https://img.logo.dev/${model.provider}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN}`}
                        alt={model.provider}
                        className="inline-flex size-4 rounded-sm mr-2"
                        width={16}
                        height={16}
                      />
                      {model.name}
                    </AIInputModelSelectItem>
                  ))}
                </AIInputModelSelectContent>
              </AIInputModelSelect>
            </AIInputTools>
            {status === 'streaming' ? (
              <AIButtonSubmit onClick={stop} variant={'outline'}>
                <StopCircle size={16} />
              </AIButtonSubmit>
            ) : (
              <AIButtonSubmit variant={'outline'} disabled={!input}>
                <SendIcon size={16} />
              </AIButtonSubmit>
            )}
          </AIInputToolbar>
        </AIForm>
      </Form>
    </div>
  )
}
