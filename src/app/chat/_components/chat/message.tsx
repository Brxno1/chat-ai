'use client'

import { Message as UIMessage } from '@ai-sdk/react'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { cleanReasoningText } from '@/app/api/chat/utils/message-parts'
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
import { useSessionUser } from '@/context/user'
import type { ChatMessage as ChatMessageType } from '@/types/chat'
import { ToolInvocationResult } from '@/types/tool-results'
import { formatDateToLocaleWithHour } from '@/utils/format'
import { cn } from '@/utils/utils'

import { ChatNews } from './chat-news'
import { ChatWeather } from './chat-weather'

function getResultToolCallIds(message: ChatMessageType) {
  return new Set(
    message.parts
      ?.filter((part) => part.type === 'tool-invocation')
      .map(
        (part) =>
          (part as { toolInvocation?: { toolCallId: string; state: string } })
            .toolInvocation,
      )
      .filter(
        (ti): ti is { toolCallId: string; state: string } =>
          ti?.state === 'result' && !!ti.toolCallId,
      )
      .map((ti) => ti.toolCallId),
  )
}

function extractReasoningParts(message: ChatMessageType) {
  const reasoningParts =
    message.parts
      ?.filter((part) => part.type === 'reasoning')
      .map((p) => cleanReasoningText(p.reasoning!))
      .join(' ') || ''

  return reasoningParts
}

interface MessageProps {
  message: UIMessage & Partial<ChatMessageType>
  modelName: string
  modelProvider: string
  isStreaming?: boolean
}

export function ChatMessage({
  message,
  modelName,
  modelProvider,
  isStreaming = false,
}: MessageProps) {
  const [open, setOpen] = useState(false)

  const { user } = useSessionUser()

  const handleCloseComponent = () => {
    setOpen(false)
  }

  const reasoningParts = extractReasoningParts(message as ChatMessageType)

  const resultToolCallIds = getResultToolCallIds(message as ChatMessageType)

  return (
    <div className="flex w-full flex-col space-y-1">
      {message.role === 'assistant' && (
        <Badge variant={'chat'} className="hover:bg-transparent">
          <Avatar className="size-5 rounded-sm max-sm:size-4">
            <AvatarImage
              src={`https://img.logo.dev/${modelProvider}?token=${process.env.NEXT_PUBLIC_LOGO_TOKEN}`}
            />
            <AvatarFallback className="rounded-sm">AI</AvatarFallback>
          </Avatar>
          <span className="max-w-[15rem] truncate text-ellipsis whitespace-nowrap">
            {modelName}
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
                className="flex w-full flex-col"
              >
                {message.role === 'user' && (
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
                )}
                <div
                  className={cn(
                    'group inline-flex items-center justify-center gap-1 overflow-y-auto rounded-lg p-1 text-accent transition-all dark:text-accent-foreground max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[70%]',
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

            if (!toolInvocation) {
              return null
            }

            const { toolCallId, toolName } = toolInvocation

            if (
              toolInvocation.state === 'call' &&
              resultToolCallIds.has(toolCallId)
            ) {
              return null
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
