'use client'

import type { UIMessage } from 'ai'
import { RefreshCw } from 'lucide-react'

import { ContainerWrapper } from '@/components/container'
import { CopyTextComponent } from '@/components/copy-text-component'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  AIReasoning,
  AIReasoningContent,
  AIReasoningTrigger,
} from '@/components/ui/kibo-ui/ai/reasoning'
import { AIResponse } from '@/components/ui/kibo-ui/ai/response'
import { useChatInstance } from '@/context/chat'
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
import { Button } from '@/components/ui/button'

interface MessageProps {
  message: UIMessage & Partial<ChatMessageType>
}

export function ChatMessage({ message }: MessageProps) {
  const { model, status, onRegenerateResponse } = useChatInstance()
  const { user } = useSessionUser()

  const isStreaming = status === 'streaming'

  const reasoningParts = extractReasoningParts(message as ChatMessageType)

  const resultToolCallIds = getResultToolCallIds(message as ChatMessageType)

  return (
    <div className="flex w-full flex-col space-y-1 pr-2">
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
                key={message.id}
                className={cn('group/container-wrapper flex flex-col', {
                  'items-end': message.role === 'user',
                  'items-start': message.role === 'assistant',
                })}
              >
                {user && message.role === 'user' && (
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
                  </>
                )}
                <div
                  className={cn(
                    'group relative inline-flex items-center justify-center gap-1 overflow-y-auto rounded-lg border border-input p-1 text-sm text-accent transition-all dark:text-accent-foreground max-md:max-w-[95%] md:max-w-[80%] md:text-base lg:max-w-[70%]',
                    {
                      'ml-auto bg-message text-accent': message.role === 'user',
                      'mr-auto bg-primary/5 text-card-foreground':
                        message.role === 'assistant',
                    },
                  )}
                >
                  <AIResponse>{part.text}</AIResponse>
                </div>
                {message.parts.some((p) => p.type === 'file') && (
                  <Attachments parts={message.parts} />
                )}
                <div className="mt-1 flex w-full items-center">
                  <Badge
                    variant="chat"
                    className={cn(
                      'text-xs text-muted-foreground hover:bg-transparent',
                      {
                        'ml-auto': message.role === 'user',
                      },
                    )}
                  >
                    {formatDateToLocaleWithHour(message.createdAt)}
                  </Badge>
                  <CopyTextComponent
                    textForCopy={part.text}
                    iconPosition="right"
                    className="size-5 cursor-pointer justify-center rounded-md opacity-0 duration-300 hover:bg-muted hover:text-foreground group-hover/container-wrapper:opacity-100"
                    iconSize={12}
                  />
                  <div
                    onClick={() => onRegenerateResponse()}
                    className="flex size-5 cursor-pointer items-center justify-center rounded-md opacity-0 duration-300 hover:bg-muted hover:text-foreground group-hover/container-wrapper:opacity-100"
                  >
                    <RefreshCw className="size-3.5" />
                  </div>
                </div>
              </ContainerWrapper>
            )
          }
          default: {
            if (!part.type.startsWith('tool-')) {
              return null
            }

            const toolPart = part as {
              type: string
              toolCallId: string
              toolName?: string
              state: string
              input?: unknown
              output?: unknown
            }

            const toolName = toolPart.toolName ?? part.type.replace('tool-', '')

            if (
              toolPart.state === 'call' &&
              resultToolCallIds.has(toolPart.toolCallId)
            ) {
              return null
            }

            const toolInvocation = { ...toolPart, toolName }

            if (toolName === 'getNews') {
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

            if (toolName === 'getWeather') {
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

            return null
          }
        }
      })}
    </div>
  )
}
