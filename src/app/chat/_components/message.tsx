'use client'

import type { UIMessage } from 'ai'

import { ContainerWrapper } from '@/components/container'
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
import type { ChatMessage } from '@/types/chat'
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
import { MessageActionFooter } from './message-action-footer'

interface MessageProps {
  message: UIMessage & Partial<ChatMessage>
}

export function ChatMessage({ message }: MessageProps) {
  const { model, streamStatus } = useChatInstance()
  const { user } = useSessionUser()

  const isStreaming =
    streamStatus === 'thinking' || streamStatus === 'responding'

  const reasoningParts = extractReasoningParts(message as ChatMessage)
  const resultToolCallIds = getResultToolCallIds(message as ChatMessage)

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
      {reasoningParts.length > 0 && (
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
            const hasFiles = message.parts.some((part) => part.type === 'file')
            const hasText = message.parts.some(
              (part) => part.type === 'text' && part.text.trim() !== '',
            )

            if (!hasText && !hasFiles) {
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
                {hasFiles && <Attachments parts={message.parts} />}
                {hasText && (
                  <div
                    className={cn(
                      'group relative inline-flex items-center justify-center gap-1 overflow-y-auto rounded-lg border border-input p-1 text-sm text-accent transition-all dark:text-accent-foreground max-md:max-w-[95%] md:max-w-[80%] md:text-base lg:max-w-[70%]',
                      {
                        'ml-auto bg-message text-accent':
                          message.role === 'user',
                        'mr-auto bg-primary/5 text-card-foreground':
                          message.role === 'assistant',
                      },
                    )}
                  >
                    <AIResponse>{part.text}</AIResponse>
                  </div>
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
                    {formatDateToLocaleWithHour(
                      message.createdAt
                        ? message.createdAt
                        : new Date(
                            (
                              message.metadata as {
                                createdAt: string | number | Date
                              }
                            )?.createdAt as string | number | Date,
                          ),
                    )}
                  </Badge>
                  <MessageActionFooter message={message} />
                </div>
              </ContainerWrapper>
            )
          }
          default: {
            if (!part.type.startsWith('tool-')) {
              return null
            }

            let toolCallId = ''
            let toolName = part.type.replace('tool-', '')
            let state = 'result'
            let rawArgs: unknown = {}
            let rawResult: unknown

            if ('toolInvocation' in part) {
              const inv = part.toolInvocation as {
                toolCallId?: string
                toolName?: string
                state?: string
                args?: unknown
                input?: unknown
                result?: unknown
                output?: unknown
              }
              toolCallId = inv.toolCallId ?? ''
              toolName = inv.toolName ?? toolName
              state = inv.state ?? state
              rawArgs =
                inv.args ??
                inv.input ??
                (part as { args?: unknown }).args ??
                (part as { input?: unknown }).input
              rawResult = inv.result ?? inv.output
            } else {
              const streamPart = part as {
                toolCallId?: string
                toolInvocationId?: string
                toolName?: string
                state?: string
                args?: unknown
                input?: unknown
                result?: unknown
                output?: unknown
              }
              toolCallId =
                streamPart.toolCallId ?? streamPart.toolInvocationId ?? ''
              toolName = streamPart.toolName ?? toolName
              state = streamPart.state ?? state
              rawArgs = streamPart.args ?? streamPart.input
              rawResult = streamPart.result ?? streamPart.output
            }

            if (!toolCallId) {
              return null
            }

            if (state === 'call' && resultToolCallIds.has(toolCallId)) {
              return null
            }

            const toolInvocation = {
              toolCallId,
              toolName,
              state,
              args: rawArgs,
              result: rawResult,
            }

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
