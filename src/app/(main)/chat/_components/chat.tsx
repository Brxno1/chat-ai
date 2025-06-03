'use client'

import { useChat } from '@ai-sdk/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import {
  GlobeIcon,
  MicIcon,
  PlusIcon,
  SendIcon,
  StopCircle,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { User } from 'next-auth'
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
import { queryKeys } from '@/lib/query-client'
import { useChatStore } from '@/store/chat-store'

import { Input } from '../../../../components/ui/input'
import { Messages } from './message'
import { models } from './models'

interface ChatProps {
  user?: User
  initialChatId?: string
}

const schema = z.object({
  message: z.string().min(1, 'Digite uma mensagem'),
})

export function Chat({ user }: ChatProps) {
  const queryClient = useQueryClient()

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
    chatId,
    setChatId,
    model,
    isCreatingNewChat,
    isGhostChatMode,
    setIsCreatingNewChat,
    onDeleteMessage,
    setModel,
    chatInstanceKey,
  } = useChatStore()

  const {
    input,
    messages: aiMessages,
    setMessages: setAiMessages,
    status,
    handleInputChange,
    handleSubmit,
    stop,
    isLoading,
  } = useChat({
    initialMessages: messages,
    key: chatInstanceKey,
    api: '/api/chat',
    body: {
      name: user?.name || undefined,
      locale: navigator.language,
      chatId,
      isGhostChatMode,
      model,
    },
    onResponse: (response) => {
      const newChatId = response.headers.get('X-Chat-Id')
      if (newChatId && !chatId) {
        setChatId(newChatId)

        if (isCreatingNewChat && !isGhostChatMode) {
          router.push(`/chat/${newChatId}`)
          queryClient.invalidateQueries({ queryKey: queryKeys.chats.all })
          setIsCreatingNewChat(false)
        }
      }
    },
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.all })
    },
  })

  const onDeleteMessageChat = (id: string) => {
    onDeleteMessage(id)
    setAiMessages((prev) => prev.filter((message) => message.id !== id))
  }

  React.useEffect(() => {
    if (status === 'ready' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [status])

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages])

  React.useEffect(() => {
    if (chatInstanceKey) {
      setAiMessages([])
    }
  }, [chatInstanceKey, setAiMessages])

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
    <div className="flex h-full w-full flex-col rounded-md border">
      <div
        className="flex-1 overflow-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-md"
        ref={containerRef}
      >
        {aiMessages.map((message) => (
          <Messages
            key={`${message.id}-${message.content.substring(0, 10)}-${Date.now()}`}
            user={user}
            message={message}
            modelName={model}
            onDeleteMessageChat={onDeleteMessageChat}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <Form {...form}>
        <AIForm onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="relative">
                <FormControl>
                  <Input
                    className="h-20 resize-none rounded-t-lg border-0 bg-card p-3 shadow-none outline-none ring-0 focus-visible:ring-0"
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
                  <TypingText
                    className="pointer-events-none absolute left-3 top-6 text-xs text-muted-foreground"
                    text="Pergunte-me qualquer coisa..."
                    delay={300}
                    loop
                  />
                )}
              </FormItem>
            )}
          />
          <AIInputToolbar className="bg-card p-3.5 transition-all max-sm:p-1.5">
            <AIInputTools>
              <AIInputButton disabled variant={'outline'}>
                <PlusIcon size={16} />
              </AIInputButton>
              <AIInputButton disabled variant={'outline'}>
                <MicIcon size={16} />
              </AIInputButton>
              <AIInputButton disabled variant={'outline'}>
                <GlobeIcon size={16} />
                <span className="transition-all max-sm:hidden">Search</span>
              </AIInputButton>
              <AIInputModelSelect value={model} onValueChange={setModel}>
                <AIInputModelSelectTrigger
                  className="flex items-center gap-2"
                  disabled={status === 'streaming'}
                >
                  <AIInputModelSelectValue />
                </AIInputModelSelectTrigger>
                <AIInputModelSelectContent>
                  {models.map((model) => (
                    <AIInputModelSelectItem
                      key={model.id}
                      value={model.id}
                      disabled={model.disabled}
                      className="text:sm transition-all max-sm:text-2xs"
                    >
                      <Image
                        src={`https://img.logo.dev/${model.provider}?token=${process.env.NEXT_PUBLIC_LOGO_TOKEN}`}
                        alt={model.provider}
                        className="mr-2 inline-flex size-4 rounded-sm transition-all max-sm:hidden"
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
              <AIButtonSubmit
                onClick={stop}
                type="button"
                className="font-bold"
              >
                <span className="transition-all max-sm:hidden">Parar</span>
                <StopCircle size={16} />
              </AIButtonSubmit>
            ) : (
              <AIButtonSubmit
                disabled={!input || form.formState.isSubmitting || isLoading}
                type="submit"
                className="font-bold"
              >
                <span className="transition-all max-sm:hidden">Enviar</span>
                <SendIcon size={16} />
              </AIButtonSubmit>
            )}
          </AIInputToolbar>
        </AIForm>
      </Form>
    </div>
  )
}
