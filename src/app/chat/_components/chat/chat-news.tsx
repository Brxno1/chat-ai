'use client'

import { Message as UIMessage } from '@ai-sdk/react'
import { ExternalLink, Newspaper } from 'lucide-react'
import { useMemo } from 'react'

import { ContainerWrapper } from '@/components/container'
import { Badge } from '@/components/ui/badge'
import type { ChatMessage } from '@/types/chat'
import type { ToolInvocationResult } from '@/types/tool-results'
import { formatDateToLocaleWithHour } from '@/utils/format'
import { cn } from '@/utils/utils'

interface ChatNewsProps {
  toolInvocation: ToolInvocationResult<'getNews'>
  message: UIMessage & Partial<ChatMessage>
}

export function ChatNews({ toolInvocation, message }: ChatNewsProps) {
  const newsResult = useMemo(() => {
    if (!toolInvocation || !toolInvocation.result) return null

    if (Array.isArray(toolInvocation.result)) {
      return toolInvocation.result
    }

    return [toolInvocation.result]
  }, [toolInvocation])

  if (!newsResult || newsResult.length === 0) return null

  return (
    <ContainerWrapper className="flex w-full flex-col">
      <div className="mr-auto rounded-lg bg-primary/10 p-3 text-card-foreground max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[70%]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-full bg-primary/15 p-1.5">
              <Newspaper className="size-6 text-primary" />
            </div>
            <span className="text-xl font-medium text-muted-foreground">
              Notícias
            </span>
          </div>

          {newsResult.map((result, index) => {
            if ('error' in result) {
              return (
                <div
                  key={`news-error-${index}`}
                  className="rounded-lg border border-destructive/50 bg-destructive/10 p-3"
                >
                  <h3 className="mb-2 text-base font-medium text-destructive">
                    {result.error!.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {result.error!.message}
                  </p>
                </div>
              )
            }

            return (
              <div
                key={`news-result-${index}`}
                className="space-y-4 rounded-lg border border-border bg-background/70 p-3"
              >
                {result.articles.map((article, articleIndex) => (
                  <div
                    key={`news-article-${index}-${articleIndex}`}
                    className="border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <h3 className="mb-1 font-medium">{article.title}</h3>
                    {article.description && (
                      <p className="mb-2 text-sm text-muted-foreground">
                        {article.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {article.source.name} •{' '}
                        {new Date(article.publishedAt).toLocaleDateString(
                          'pt-BR',
                        )}
                      </span>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs text-primary hover:bg-primary/20"
                      >
                        <span>Ler mais</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
      <Badge
        variant={'chat'}
        className={cn('text-xs text-muted-foreground hover:bg-transparent')}
      >
        {formatDateToLocaleWithHour(message.createdAt!)}
      </Badge>
    </ContainerWrapper>
  )
}
