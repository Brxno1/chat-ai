'use client'

import type { UIMessage } from 'ai'
import React from 'react'

import { ContainerWrapper } from '@/components/container'
import { Badge } from '@/components/ui/badge'
import type { ChatMessage } from '@/types/chat'
import type {
  NewsArticle,
  NewsErrorResponse,
  NewsToolResponse,
} from '@/types/news'
import type { ToolInvocationResult } from '@/types/tool-results'
import { formatDateToLocaleWithHour } from '@/utils/format'

import { NewsCard, NewsLoading } from './ui/widgets/news'
import { NewsError } from './ui/widgets/news/error'
import { NewsHeader } from './ui/widgets/news/header'

interface ChatNewsProps {
  toolInvocation: ToolInvocationResult<'getNews'>
  message: UIMessage & Partial<ChatMessage>
}

export function ChatNews({ toolInvocation, message }: ChatNewsProps) {
  const [stuckToolIds, setStuckToolIds] = React.useState<Set<string>>(new Set())
  const { toolCallId, state } = toolInvocation
  const args = toolInvocation.args ?? toolInvocation.input
  const result = toolInvocation.result ?? toolInvocation.output

  React.useEffect(() => {
    if (!message.parts) return

    const toolCalls = message.parts
      .filter((part) => part.type.startsWith('tool-'))
      .map((part) => {
        let toolCallId = ''
        let toolName = part.type.replace('tool-', '')
        let state = 'result'

        if ('toolInvocation' in part) {
          const inv = part.toolInvocation as {
            toolCallId?: string
            toolName?: string
            state?: string
          }
          toolCallId = inv.toolCallId ?? ''
          toolName = inv.toolName ?? toolName
          state = inv.state ?? state
        } else {
          const streamPart = part as {
            toolCallId?: string
            toolInvocationId?: string
            toolName?: string
            state?: string
          }
          toolCallId =
            streamPart.toolCallId ?? streamPart.toolInvocationId ?? ''
          toolName = streamPart.toolName ?? toolName
          state = streamPart.state ?? state
        }

        return { toolCallId, toolName, state }
      })
      .filter((tool) => tool.state === 'call' && tool.toolName === 'getNews')

    if (toolCalls.length === 0) return

    const timeout = setTimeout(() => {
      setStuckToolIds((prev) => {
        const updated = new Set(prev)
        toolCalls.forEach((tool) => updated.add(tool.toolCallId))
        return updated
      })
    }, 5000)

    return () => clearTimeout(timeout)
  }, [message.parts])

  const TimeBadge = () => (
    <Badge
      variant={'chat'}
      className="text-xs text-muted-foreground hover:bg-transparent"
    >
      {formatDateToLocaleWithHour(
        message.createdAt ??
          ((message.metadata as { createdAt?: number })?.createdAt
            ? new Date((message.metadata as { createdAt?: number }).createdAt!)
            : undefined),
      )}
    </Badge>
  )

  const renderContent = () => {
    // v6 states: 'input-streaming', 'call', 'output-available', 'output-denied', 'done'
    const hasResult =
      state === 'result' || state === 'output-available' || state === 'done'
    const isLoading = state === 'call' || state === 'input-streaming'

    if (hasResult && result) {
      if ('error' in result) {
        const errorResult = result as NewsErrorResponse
        return (
          <div className="mr-auto max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[73%]">
            <NewsError
              title={errorResult.error.title}
              message={errorResult.error.message}
            />
          </div>
        )
      }

      const resultArray = Array.isArray(result) ? result : [result]
      return (
        <div className="mr-auto rounded-lg bg-primary/10 p-3 text-card-foreground max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[60%]">
          <div className="flex flex-col gap-1">
            <NewsHeader topic={args?.topic ?? ''} />
            {resultArray.map((item: NewsToolResponse, index: number) => (
              <NewsCard key={`news-${index}`} article={item as NewsArticle} />
            ))}
          </div>
        </div>
      )
    }

    if (isLoading) {
      if (stuckToolIds.has(toolCallId)) {
        return (
          <div className="mr-auto max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[73%]">
            <NewsError
              title="Erro de conexão"
              message={`Não foi possível obter notícias sobre "${args?.topic ?? ''}". Por favor, tente novamente mais tarde.`}
            />
          </div>
        )
      }
      return <NewsLoading topic={args?.topic ?? ''} />
    }

    return null
  }

  return (
    <ContainerWrapper className="mt-1 flex w-full flex-col">
      {renderContent()}
      <TimeBadge />
    </ContainerWrapper>
  )
}
