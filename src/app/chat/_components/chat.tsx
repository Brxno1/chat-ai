'use client'

import { Message as MessageType, useChat } from '@ai-sdk/react'
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
import { toast } from 'sonner'
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

import { Input } from '../../../components/ui/input'
import { Messages } from './message'
import { models } from './models'

interface ChatProps {
  user?: User
  initialChatId?: string
  initialMessages?: MessageType[]
}

const schema = z.object({
  message: z.string().min(1, 'Digite uma mensagem'),
})

export function Chat({ user, initialMessages }: ChatProps) {
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
    chatId,
    model,
    isGhostChatMode,
    setIsCreatingNewChat,
    onDeleteMessage,
    setModel,
    chatInstanceKey,
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
    key: chatInstanceKey,
    api: '/api/chat',
    body: {
      name: user?.name || undefined,
      locale: navigator.language,
      chatId,
      isGhostChatMode,
      model,
    },
    onResponse: async (response) => {
      const stream = response.body
      if (!stream) {
        console.error('Nenhum stream encontrado na resposta')
        return
      }

      const reader = stream.getReader()
      const decoder = new TextDecoder('utf-8')
      let result = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        result += chunk

        if (result.startsWith('3:"Failed after 3 attempts. Last error:')) {
          toast.warning(
            'Você atingiu o limite de mensagens do plano gratuito, tente novamente mais tarde.',
            {
              position: 'top-center',
              duration: 3000,
            },
          )
        }

        const currentChatId = response.headers.get('X-Chat-Id')

        if (currentChatId && !chatId) {
          if (!isGhostChatMode) {
            queryClient.invalidateQueries({ queryKey: queryKeys.chats.all })
            router.push(`/chat/${currentChatId}`)
          }
        }
      }
    },
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.all })
    },
  })

  const onDeleteMessageChat = (id: string) => {
    onDeleteMessage(id)
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
  }, [chatInstanceKey, setMessages, initialMessages])

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
        {messages.map((message, index) => (
          <Messages
            key={`${message.id}-${index}-${Date.now()}`}
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
                    disabled={status === 'streaming' || isLoading}
                    value={field.value}
                    ref={inputRef}
                    onChange={(ev) => {
                      field.onChange(ev)
                      handleInputChange(ev)
                    }}
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
