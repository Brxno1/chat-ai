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
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { ComponentSwitchTheme } from '@/components/switch-theme'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import {
  AIForm,
  AIInputButton,
  AIInputModelSelect,
  AIInputModelSelectContent,
  AIInputModelSelectItem,
  AIInputModelSelectTrigger,
  AIInputModelSelectValue,
  AIButtonSubmit, AIInputToolbar,
  AIInputTools
} from '@/components/ui/kibo-ui/ai/input'

import { ChatHeader } from './header'
import { Messages } from './message'
import { models } from './models'
import Image from 'next/image'
import { TypingAnimation } from '../magicui/typing-animation'
import { Historical } from './historical'
import { ContainerWrapper } from '../container'
import { Input } from '../ui/input'
import { User } from 'next-auth'
import { api } from '@/lib/axios'

interface ChatProps {
  modelName: string
  initialUser?: User
  chatId?: string
}

interface Chat {
  id: string
  title: string
  createdAt: string
  messages: Array<{
    id: string
    content: string
    role: string
    createdAt: string
  }>
}

async function fetchChatDetail(chatId: string) {
  if (!chatId) return null

  const response = await api.get(`/api/chats/${chatId}`)
  if (!response.data.chat) {
    throw new Error('Falha ao carregar conversa')
  }

  const data = await response.data
  return data.chat as Chat
}

const schema = z.object({
  message: z.string().min(1, 'Digite uma mensagem'),
})

export function Chat({ modelName, initialUser, chatId: initialChatId }: ChatProps) {
  const [model, setModel] = React.useState<string>(models[0].id)
  const [isGhost, setIsGhost] = React.useState<boolean>(false)
  const [chatId, setChatId] = React.useState<string | undefined>(initialChatId)
  const [isCreatingNewChat, setIsCreatingNewChat] = React.useState<boolean>(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: '',
    },
  })

  const router = useRouter()
  const user = initialUser

  // Buscar detalhes do chat quando temos um chatId inicial
  const { data: chatDetail, isLoading: isLoadingChat } = useQuery<Chat | null>({
    queryKey: ['chat', initialChatId],
    queryFn: () => fetchChatDetail(initialChatId || ''),
    enabled: !!initialChatId && !!user && !isGhost,
  })

  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

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
      chatId,
    },
    onResponse: (response) => {
      const newChatId = response.headers.get('X-Chat-Id')
      if (newChatId && !chatId) {
        setChatId(newChatId)

        if (isCreatingNewChat && !isGhost) {
          router.push(`/chat/${newChatId}`)
          setIsCreatingNewChat(false)
        }
      }
    },
  })

  const onDeleteMessageChat = (id: string) => {
    setMessages((prevMessages) =>
      prevMessages.filter((message) => message.id !== id),
    )
  }

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  React.useEffect(() => {
    form.setFocus('message')
  }, [form])

  const resetChat = () => {
    setChatId(undefined)
    setMessages([])
    setIsCreatingNewChat(false)
    form.reset()
    form.setFocus('message')

    if (initialChatId) {
      router.push('/chat')
    }
  }

  const onSubmit = async () => {
    if (!chatId && !isGhost && user) {
      setIsCreatingNewChat(true)
    }

    try {
      handleSubmit()
      form.reset()
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  const handleNewChat = () => {
    if (messages.length > 0) {
      resetChat()
    }
  }

  return (
    <div
      className="grid size-full max-w-xl flex-col border border-border grid-rows-[auto_1fr_auto]"
    >
      <header className="sticky top-0 flex h-fit items-center justify-end border bg-background p-3">
        {user ? (
          <ContainerWrapper className="flex items-center justify-between w-full">
            <div className="flex gap-1">
              <Historical disabled={isGhost} />
              <Button
                variant="link"
                size="icon"
                onClick={handleNewChat}
                disabled={isGhost || status === 'streaming'}
              >
                <MessageCirclePlus size={16} />
              </Button>
              <Button
                variant="link"
                size="icon"
                onClick={() => setIsGhost(!isGhost)}
              >
                <Ghost size={16} className={isGhost ? 'text-primary' : ''} />
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
      <div className="overflow-y-auto px-2" ref={containerRef}>
        {isLoadingChat ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground text-center">Carregando conversa...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground text-center max-w-md px-4">
              {isGhost ?
                "Modo visitante ativado. Suas mensagens não serão salvas." :
                null}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <Messages
              key={`${message.id}-${message.content.substring(0, 10)}`}
              message={message}
              modelName={modelName}
              onDeleteMessageChat={onDeleteMessageChat}
            />
          ))
        )}
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
                <FormControl>
                  <Input
                    className='h-20 resize-none rounded-none border-none p-3 shadow-none outline-none ring-0 focus-visible:ring-0'
                    value={field.value}
                    onChange={(ev) => {
                      field.onChange(ev)
                      handleInputChange(ev)
                    }}
                    disabled={status === 'streaming' || isLoadingChat}
                  />
                </FormControl>
                {!field.value && (
                  <TypingAnimation
                    className="pointer-events-none text-xs text-muted-foreground absolute left-3 top-6"
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
              <AIButtonSubmit
                variant={'outline'}
                disabled={!input || form.formState.isSubmitting || isLoadingChat}
                type='submit'
              >
                <SendIcon size={16} />
              </AIButtonSubmit>
            )}
          </AIInputToolbar>
        </AIForm>
      </Form>
    </div>
  )
}
