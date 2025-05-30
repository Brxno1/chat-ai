'use client'

import { useChat } from '@ai-sdk/react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Ghost,
  GlobeIcon, MessageCirclePlus,
  MicIcon,
  PlusIcon,
  SendIcon,
  StopCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
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

import { Messages } from './message'
import { models } from './models'
import Image from 'next/image'
import { TypingAnimation } from '../magicui/typing-animation'
import { Historical } from './historical'
import { ContainerWrapper } from '../container'
import { Input } from '../ui/input'
import { User } from 'next-auth'
import { toast } from 'sonner'

interface ChatProps {
  user?: User
  initialChatId?: string
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
const schema = z.object({
  message: z.string().min(1, 'Digite uma mensagem'),
})

export function Chat({ user, initialChatId }: ChatProps) {
  const [model, setModel] = React.useState(models[0].id)
  const [isGhostChatMode, setIsGhostChatMode] = React.useState(false)
  const [chatId, setChatId] = React.useState(initialChatId)
  const [isCreatingNewChat, setIsCreatingNewChat] = React.useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: '',
    },
  })

  const router = useRouter()

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
    isLoading
  } = useChat({
    api: '/api/chat',
    body: {
      name: user?.name || undefined,
      locale: navigator.language,
      chatId,
      isGhostChatMode,
    },
    onResponse: (response) => {
      const newChatId = response.headers.get('X-Chat-Id')
      if (newChatId && !chatId) {
        setChatId(newChatId)

        if (isCreatingNewChat && !isGhostChatMode) {
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

  const resetChat = () => {
    setChatId(undefined)
    setMessages([])
    setIsCreatingNewChat(false)
    form.reset()

    if (initialChatId) {
      router.push('/chat')
    }
  }

  const handleNewChat = () => {
    if (messages.length > 0) {
      resetChat()
    }
  }

  const handleGhostChatMode = () => {
    toast('', {
      action: (
        <p className='text-sm'>
          Chat fantasma:{' '}
          <span data-ghost={isGhostChatMode} className='font-bold data-[ghost=true]:text-red-400 data-[ghost=false]:text-green-400'>
            {!isGhostChatMode ? 'ativado' : 'desativado'}
          </span>
        </p>
      ),
      position: 'top-center',
      duration: 1500,
    })
    setIsGhostChatMode((prev) => !prev)
  }

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  React.useEffect(() => {
    if (status === 'ready' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [status])

  const onSubmit = async () => {
    if (!chatId && !isGhostChatMode && user) {
      setIsCreatingNewChat(true)
    }

    try {
      handleSubmit()
      form.reset()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <div
      className="grid size-full flex-col border border-border grid-rows-[auto_1fr_auto] max-w-4xl"
    >
      <header className="sticky top-0 flex h-fit items-center justify-end border-b border-border bg-card p-[0.849rem]">
        {user ? (
          <ContainerWrapper className="flex items-center justify-between w-full">
            <div className="flex gap-1">
              <Historical disabled={isGhostChatMode} />
              <Button
                variant="link"
                size="icon"
                onClick={handleNewChat}
                disabled={isGhostChatMode || status === 'streaming' || input.length === 0}
              >
                <MessageCirclePlus size={16} />
              </Button>
              <Button
                variant="link"
                size="icon"
                onClick={handleGhostChatMode}
                disabled={status === 'streaming'}
              >
                <Ghost size={16} className={isGhostChatMode ? 'text-primary' : ''} />
              </Button>
            </div>
            <ComponentSwitchTheme />
          </ContainerWrapper>
        ) : (
          <div className="flex w-full items-center justify-end px-2">
            <ComponentSwitchTheme />
          </div>
        )}
      </header>
      <div className="overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-full p-4 pb-6" ref={containerRef}>
        {messages.map((message) => (
          <Messages
            key={`${message.id}-${message.content.substring(0, 10)}`}
            user={user}
            message={message}
            modelName={model}
            onDeleteMessageChat={onDeleteMessageChat}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <Form {...form}>
        <AIForm
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className='relative'>
                <FormControl>
                  <Input
                    className="h-20 resize-none rounded-t-lg border-0 p-3 shadow-none outline-none ring-0 focus-visible:ring-0"
                    value={field.value}
                    ref={inputRef}
                    onChange={(ev) => {
                      field.onChange(ev)
                      handleInputChange(ev)
                    }}
                    disabled={status === 'streaming' || isLoading}
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
          <AIInputToolbar className="p-4">
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
              <AIButtonSubmit onClick={stop} type='button'>
                <StopCircle size={16} />
              </AIButtonSubmit>
            ) : (
              <AIButtonSubmit
                disabled={!input || form.formState.isSubmitting || isLoading}
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
