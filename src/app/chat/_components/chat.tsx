'use client'

import { Message, useChat } from '@ai-sdk/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import {
  ChevronsUpDown,
  GlobeIcon,
  MicIcon,
  PlusIcon,
  SendIcon,
  StopCircle,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { TypingText } from '@/components/animate-ui/text/typing'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import {
  AIButtonSubmit,
  AIForm,
  AIInputButton,
  AIInputModelSelect,
  AIInputModelSelectContent,
  AIInputModelSelectItem,
  AIInputModelSelectTrigger,
  AIInputModelSelectValue,
  AIInputToolbar,
  AIInputTools,
} from '@/components/ui/kibo-ui/ai/input'
import { useUser } from '@/context/user-provider'
import { queryKeys } from '@/lib/query-client'
import { useChatStore } from '@/store/chat-store'

import { Input } from '../../../components/ui/input'
import { Messages } from './message'
import { models } from './models'

interface ChatProps {
  initialMessages?: Message[]
  currentChatId?: string
}

const schema = z.object({
  message: z.string().min(1),
})

export function Chat({ initialMessages, currentChatId }: ChatProps) {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { user } = useUser()

  const id = React.useId()

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: '',
    },
  })

  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const {
    model,
    modelProvider,
    setModel,
    setModelProvider,
    isGhostChatMode,
    chatInstanceKey,
    defineChatInstanceKey,
    getChatInstanceKey,
  } = useChatStore()

  const {
    input,
    messages,
    setMessages,
    status,
    handleInputChange,
    handleSubmit,
    stop,
    isLoading,
  } = useChat({
    initialMessages,
    key: currentChatId || getChatInstanceKey(),
    api: '/api/chat',
    body: {
      name: user?.name || undefined,
      chatId: currentChatId || '',
      isGhostChatMode,
      model,
    },
    onResponse: (response) => {
      const headerChatId = response.headers?.get('x-chat-id')

      if (headerChatId) {
        defineChatInstanceKey(headerChatId)
      }
    },
    onFinish: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.chats.all,
      })

      const currentKey = getChatInstanceKey()
      if (currentKey && !isGhostChatMode) {
        router.push(`/chat/${currentKey}`)
      }
    },
  })

  const onDeleteMessageChat = (id: string) => {
    setMessages((prev) => prev.filter((message) => message.id !== id))
  }

  React.useEffect(() => {
    if (status === 'ready' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [status])

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  React.useEffect(() => {
    if (chatInstanceKey && !initialMessages?.length) {
      setMessages([])
    }
  }, [chatInstanceKey, initialMessages])

  const handleChatSubmit = () => {
    handleSubmit()
  }

  const handleModelChange = (value: string) => {
    const model = models.find((model) => model.id === value)

    if (model) {
      setModel(model.id)
      setModelProvider(model.provider)
    }
  }

  return (
    <div className="flex h-full w-full flex-col rounded-md border">
      <div
        className="flex-1 overflow-auto p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-md"
        ref={containerRef}
      >
        {messages.map((message, index) => (
          <Messages
            key={`${index}-${id}`}
            message={message}
            modelName={model}
            modelProvider={modelProvider}
            onDeleteMessageChat={onDeleteMessageChat}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <Form {...form}>
        <AIForm
          onSubmit={form.handleSubmit(handleChatSubmit)}
          className="border-t bg-card"
        >
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="relative">
                <FormControl>
                  <Input
                    className="h-14 resize-none rounded-t-lg border-0 shadow-none outline-none ring-0 transition-all duration-300 focus-visible:ring-0 sm:h-16"
                    disabled={status === 'streaming' || isLoading}
                    value={input}
                    ref={inputRef}
                    onChange={(ev) => {
                      field.onChange(ev)
                      handleInputChange(ev)
                    }}
                  />
                </FormControl>
                {!input && (
                  <TypingText
                    className="pointer-events-none absolute left-2 top-[40%] -translate-y-1/2 text-xs text-muted-foreground transition-all duration-300 sm:text-sm"
                    text="Pergunte-me qualquer coisa..."
                    delay={200}
                    loop
                  />
                )}
              </FormItem>
            )}
          />
          <AIInputToolbar className="p-1.5 transition-all sm:p-3.5">
            <AIInputTools>
              <AIInputButton disabled variant={'outline'}>
                <PlusIcon size={16} />
              </AIInputButton>
              <AIInputButton disabled variant={'outline'}>
                <MicIcon size={16} />
              </AIInputButton>
              <AIInputButton disabled variant={'outline'}>
                <GlobeIcon size={16} />
                <span className="hidden transition-all sm:inline-block">
                  Search
                </span>
              </AIInputButton>
              <AIInputModelSelect
                value={model}
                onValueChange={handleModelChange}
              >
                <AIInputModelSelectTrigger
                  className="flex items-center gap-1 border-none text-sm transition-all max-sm:px-1.5 max-sm:text-xs [&_img]:max-sm:hidden"
                  disabled={status === 'streaming'}
                >
                  <AIInputModelSelectValue />
                  <ChevronsUpDown className="size-4 opacity-50" />
                </AIInputModelSelectTrigger>
                <AIInputModelSelectContent>
                  {models.map((model) => (
                    <AIInputModelSelectItem
                      value={model.id}
                      key={model.id}
                      disabled={model.disabled}
                      className="text:xs flex flex-row items-center gap-2 transition-all sm:text-sm"
                    >
                      <Image
                        src={`https://img.logo.dev/${model.provider}?token=${process.env.NEXT_PUBLIC_LOGO_TOKEN}`}
                        alt={model.provider}
                        className="mr-2 inline-flex size-4 rounded-sm"
                        width={16}
                        height={16}
                      />
                      <span className="truncate">{model.name}</span>
                    </AIInputModelSelectItem>
                  ))}
                </AIInputModelSelectContent>
              </AIInputModelSelect>
            </AIInputTools>
            {status === 'streaming' ? (
              <AIButtonSubmit
                onClick={stop}
                type="button"
                className="max-sm:p-2"
              >
                <span className="font-bold transition-all max-sm:hidden">
                  Parar
                </span>
                <StopCircle size={16} />
              </AIButtonSubmit>
            ) : (
              <AIButtonSubmit
                disabled={!input || form.formState.isSubmitting || isLoading}
                type="submit"
                className="max-sm:p-2"
              >
                <span className="font-bold transition-all max-sm:hidden">
                  Enviar
                </span>
                <SendIcon size={16} />
              </AIButtonSubmit>
            )}
          </AIInputToolbar>
        </AIForm>
      </Form>
    </div>
  )
}
