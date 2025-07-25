'use client'

import { Message as UIMessage } from '@ai-sdk/react'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { ContainerWrapper } from '@/components/container'
import { CopyTextComponent } from '@/components/copy-text-component'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AIReasoning,
  AIReasoningContent,
  AIReasoningTrigger,
} from '@/components/ui/kibo-ui/ai/reasoning'
import { AIResponse } from '@/components/ui/kibo-ui/ai/response'
import { useChatContext } from '@/context/chat'
import { useSessionUser } from '@/context/user'
import type { ChatMessage as ChatMessageType } from '@/types/chat'
import { ToolInvocationResult } from '@/types/tool-results'
import {
  extractReasoningParts,
  getResultToolCallIds,
} from '@/utils/chat-helpers'
import { formatDateToLocaleWithHour } from '@/utils/format'
import { cn } from '@/utils/utils'

import { Attachments } from './attachments'
import { ChatNews } from './chat-news'
import { ChatWeather } from './chat-weather'

interface MessageProps {
  message: UIMessage & Partial<ChatMessageType>
}

export function ChatMessage({ message }: MessageProps) {
  const [open, setOpen] = useState(false)

  const { model, status } = useChatContext()
  const { user } = useSessionUser()

  const handleCloseComponent = () => {
    setOpen(false)
  }

  const isStreaming = status === 'streaming'

  const reasoningParts = extractReasoningParts(message as ChatMessageType)

  const resultToolCallIds = getResultToolCallIds(message as ChatMessageType)

  return (
    <div className="flex w-full flex-col space-y-1">
      {message.role === 'assistant' && (
        <Badge variant={'chat'} className="hover:bg-transparent">
          <Avatar className="size-5 rounded-sm max-sm:size-4">
            <AvatarImage
              src={`https://img.logo.dev/${model.provider}?token=${process.env.NEXT_PUBLIC_LOGO_TOKEN}`}
            />
            <AvatarFallback className="rounded-sm">AI</AvatarFallback>
          </Avatar>
          <span className="max-w-[15rem] truncate text-ellipsis whitespace-nowrap">
            {model.name}
          </span>
        </Badge>
      )}
      {message.role === 'assistant' && reasoningParts.length > 0 && (
        <AIReasoning isStreaming={isStreaming} defaultOpen={isStreaming}>
          <AIReasoningTrigger
            title="Raciocínio"
            className="ml-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          />
          <AIReasoningContent>{reasoningParts}</AIReasoningContent>
        </AIReasoning>
      )}
      {message.parts?.map((part, partIndex) => {
        switch (part.type) {
          case 'text': {
            if (!part.text || part.text.trim() === '') {
              return null
            }

            return (
              <ContainerWrapper
                key={`${message.id}-text-${partIndex}`}
                className={cn('flex flex-col', {
                  'items-end': message.role === 'user',
                  'items-start': message.role === 'assistant',
                })}
              >
                {message.role === 'user' && (
                  <>
                    <Badge
                      variant={'chat'}
                      className="ml-auto flex w-fit items-center justify-center hover:bg-transparent"
                    >
                      <span className="max-w-[10rem] truncate text-ellipsis whitespace-nowrap">
                        {user?.name}
                      </span>
                      <Avatar className="size-6 rounded-sm border-0 bg-transparent max-sm:size-5">
                        <AvatarImage src={user?.image ?? ''} />
                        <AvatarFallback className="rounded-sm">
                          {user?.name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Badge>
                    {message.experimental_attachments && (
                      <Attachments
                        attachments={message.experimental_attachments}
                      />
                    )}
                  </>
                )}
                <div
                  className={cn(
                    'group inline-flex items-center justify-center gap-1 overflow-y-auto rounded-lg p-1 text-accent transition-all dark:text-accent-foreground max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[60%]',
                    {
                      'ml-auto bg-message text-accent dark:bg-primary/10':
                        message.role === 'user',
                      'mr-auto bg-primary/10 text-card-foreground':
                        message.role === 'assistant',
                    },
                  )}
                >
                  <AIResponse>{part.text}</AIResponse>
                  <DropdownMenu open={open} onOpenChange={setOpen}>
                    <DropdownMenuTrigger className="mb-auto mr-1.5 mt-1.5 size-4 cursor-pointer text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:text-accent-foreground">
                      <ChevronDown size={16} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="flex flex-col items-center gap-2"
                      side="bottom"
                      align="end"
                    >
                      <DropdownMenuItem className="flex cursor-pointer items-center justify-center">
                        <CopyTextComponent
                          textForCopy={part.text}
                          onCloseComponent={handleCloseComponent}
                          iconPosition="right"
                        >
                          <span className="text-xs">Copiar</span>
                        </CopyTextComponent>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Badge
                  variant={'chat'}
                  className={cn(
                    'text-xs text-muted-foreground hover:bg-transparent',
                    {
                      'ml-auto': message.role === 'user',
                    },
                  )}
                >
                  {formatDateToLocaleWithHour(message.createdAt!)}
                </Badge>
              </ContainerWrapper>
            )
          }
          case 'tool-invocation': {
            const { toolInvocation } = part

            if (
              !toolInvocation ||
              (toolInvocation.state === 'call' &&
                resultToolCallIds.has(toolInvocation.toolCallId))
            ) {
              return null
            }

            if (toolInvocation.toolName === 'getNews') {
              return (
                <ChatNews
                  key={`${message.id}-tool-${partIndex}`}
                  message={message}
                  toolInvocation={
                    toolInvocation as ToolInvocationResult<'getNews'>
                  }
                />
              )
            }

            return (
              <ChatWeather
                key={`${message.id}-tool-${partIndex}`}
                message={message}
                toolInvocation={
                  toolInvocation as ToolInvocationResult<'getWeather'>
                }
              />
            )
          }
          default:
            return null
        }
      })}
    </div>
  )
}
