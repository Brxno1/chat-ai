'use client'

import { Message as UIMessage } from '@ai-sdk/react'
import { Cloud, Loader2 } from 'lucide-react'
import React from 'react'

import { WeatherToolResponse } from '@/app/api/chat/tools/weather'
import { ContainerWrapper } from '@/components/container'
import { Badge } from '@/components/ui/badge'
import { MessageLoading } from '@/components/ui/message-loading'
import { ToolInvocationResult } from '@/types/tool-results'
import { formatDateToLocaleWithHour, formatLocations } from '@/utils/format'

import { WeatherCard } from '../ui/widgets/weather'
import { WeatherErrorCard } from '../ui/widgets/weather/weather-error'
import { CustomMessage } from '.'

interface ChatWeatherProps {
  toolInvocation: ToolInvocationResult<'getWeather'>
  message: UIMessage & Partial<CustomMessage>
}

export function ChatWeather({ toolInvocation, message }: ChatWeatherProps) {
  const [stuckToolIds, setStuckToolIds] = React.useState<Set<string>>(new Set())
  const { toolCallId, args, state, result } = toolInvocation

  React.useEffect(() => {
    if (!message.parts) return

    const toolCalls = message.parts
      .filter((part) => part.type === 'tool-invocation')
      .map((part) => part.toolInvocation)
      .filter((tool) => tool.state === 'call' && tool.toolName === 'getWeather')

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

  const LoadingContent = () => (
    <div className="mr-auto rounded-lg bg-primary/10 p-3 text-card-foreground max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[73%]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex animate-pulse items-center justify-center rounded-full bg-primary/20 p-1.5">
            <Cloud className="size-6 text-primary" />
          </div>
          <span className="text-xl font-medium text-muted-foreground">
            Informações do clima
          </span>
        </div>

        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Loader2 className="size-3 animate-spin text-muted-foreground md:size-3.5" />
            <span className="text-xs lg:text-sm">
              Buscando dados para {formatLocations(args.location)}...
            </span>
          </div>

          <div className="mb-2 flex items-center justify-between rounded-md bg-background/50 p-2.5">
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-20 animate-pulse rounded-md bg-primary/20" />
              <div className="h-2.5 w-28 animate-pulse rounded-md bg-primary/10" />
            </div>
            <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-primary/25">
              <Cloud className="size-6 text-primary" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {args.location.map((location, i) => (
              <div
                className="flex flex-col gap-2 rounded-md bg-background/50 p-2.5"
                key={`forecast-${location}-${i}`}
              >
                <div className="flex items-center gap-2">
                  <div className="size-4 rounded-full bg-primary/15" />
                  <div className="h-2.5 w-14 animate-pulse rounded-sm bg-primary/15" />
                </div>
                <div className="h-2 w-8 animate-pulse rounded-sm bg-primary/20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (state) {
      case 'result':
        return (
          <div className="mr-auto grid grid-cols-1 gap-2.5 transition-all duration-300 lg:grid-cols-2">
            {result.map((weatherResult: WeatherToolResponse, index: number) =>
              weatherResult.error ? (
                <WeatherErrorCard
                  key={`weather-error-${index}`}
                  location={weatherResult.error.location}
                  error={weatherResult.error.message}
                  code={weatherResult.error.code}
                />
              ) : (
                <WeatherCard key={`weather-${index}`} result={weatherResult} />
              ),
            )}
          </div>
        )

      case 'call':
        if (stuckToolIds.has(toolCallId)) {
          return (
            <div className="mr-auto max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[73%]">
              <WeatherErrorCard
                location={formatLocations(args.location)}
                error={`Não foi possível obter os dados meteorológicos para ${formatLocations(args.location)}. Por favor, tente novamente ou verifique se o nome da localização está correto.`}
                code="NETWORK_ERROR"
              />
            </div>
          )
        }
        return <LoadingContent />

      default:
        return (
          <div className="mr-auto rounded-lg bg-primary/10 p-3 text-card-foreground max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[73%]">
            <div className="flex items-center">
              <MessageLoading className="size-4" />
            </div>
          </div>
        )
    }
  }

  return (
    <ContainerWrapper className="mt-1 flex w-full flex-col">
      {renderContent()}
      <TimeBadge />
    </ContainerWrapper>
  )
}
