'use client'

import { Message as UIMessage } from '@ai-sdk/react'
import React from 'react'

import { ContainerWrapper } from '@/components/container'
import { Badge } from '@/components/ui/badge'
import type { ChatMessage } from '@/types/chat'
import type { NewsArticle, NewsToolResponse } from '@/types/news'
import type { ToolInvocationResult } from '@/types/tool-results'
import { formatDateToLocaleWithHour } from '@/utils/format'

import { NewsCard, NewsLoading } from '../ui/widgets/news'
import { NewsError } from '../ui/widgets/news/error'
import { NewsHeader } from '../ui/widgets/news/header'

interface ChatNewsProps {
  toolInvocation: ToolInvocationResult<'getNews'>
  message: UIMessage & Partial<ChatMessage>
}

export function ChatNews({ toolInvocation, message }: ChatNewsProps) {
  const [stuckToolIds, setStuckToolIds] = React.useState<Set<string>>(new Set())
  const { toolCallId, args, state, result } = toolInvocation

  React.useEffect(() => {
    if (!message.parts) return

    const toolCalls = message.parts
      .filter((part) => part.type === 'tool-invocation')
      .map((part) => part.toolInvocation)
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
      {formatDateToLocaleWithHour(message.createdAt!)}
    </Badge>
  )

  const renderContent = () => {
    switch (state) {
      case 'result':
        if (!result) return null

        return (
          <div className="mr-auto rounded-lg bg-primary/10 p-3 text-card-foreground max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[60%]">
            <div className="flex flex-col gap-1">
              <NewsHeader topic={args.topic} />
              {result.map((item: NewsToolResponse, index: number) =>
                item.error ? (
                  <NewsError
                    key={`news-error-${index}`}
                    title={item.error.title}
                    message={item.error.message}
                  />
                ) : (
                  <NewsCard
                    key={`news-${index}`}
                    article={item as NewsArticle}
                  />
                ),
              )}
            </div>
          </div>
        )

      case 'call':
        if (stuckToolIds.has(toolCallId)) {
          return (
            <div className="mr-auto max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[73%]">
              <NewsError
                title="Erro de conexão"
                message={`Não foi possível obter notícias sobre "${args.topic}". Por favor, tente novamente mais tarde.`}
              />
            </div>
          )
        }
        return <NewsLoading topic={args.topic} />

      default:
        return null
    }
  }

  return (
    <ContainerWrapper className="mt-1 flex w-full flex-col">
      {renderContent()}
      <TimeBadge />
    </ContainerWrapper>
  )
}
