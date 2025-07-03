/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { Message } from '@ai-sdk/react'
import { ToolInvocation } from 'ai'
import React from 'react'

import { WeatherToolResponse } from '@/app/api/chat/tools/weather'
import { ContainerWrapper } from '@/components/container'
import { Badge } from '@/components/ui/badge'
import { MessageLoading } from '@/components/ui/message-loading'
import { useWeatherResult } from '@/hooks/use-tool-result'
import { formatDateToLocaleWithHour } from '@/utils/format'

import { WeatherCard } from '../ui/widgets/weather'
import { WeatherErrorCard } from '../ui/widgets/weather/weather-error'

interface ChatWeatherProps {
  toolInvocation: ToolInvocation
  message: Message
}

export function ChatWeather({ toolInvocation, message }: ChatWeatherProps) {
  const [stuckToolCalls, setStuckToolCalls] = React.useState<Set<string>>(
    new Set(),
  )

  React.useEffect(() => {
    if (!message.parts) return

    const toolCalls = message.parts
      .filter((part) => part.type === 'tool-invocation')
      .map((part) => part.toolInvocation)
      .filter((tool) => tool.state === 'call' && tool.toolName === 'getWeather')

    if (toolCalls.length === 0) return

    const timeout = setTimeout(() => {
      const newStuckCalls = new Set(stuckToolCalls)

      toolCalls.forEach((tool) => {
        newStuckCalls.add(tool.toolCallId)
      })

      setStuckToolCalls(newStuckCalls)
    }, 5000)

    return () => clearTimeout(timeout)
  }, [message.parts, stuckToolCalls])

  const TimeBadge = () => {
    return (
      <Badge
        variant={'chat'}
        className="text-xs text-muted-foreground hover:bg-transparent"
      >
        {formatDateToLocaleWithHour(new Date(message.createdAt!))}
      </Badge>
    )
  }
  const { toolCallId, args } = toolInvocation

  const ResultState = () => {
    const { allResults } = useWeatherResult(toolInvocation)

    return (
      <ContainerWrapper className="flex w-full flex-col">
        <div className="mr-auto grid grid-cols-1 gap-2.5 transition-all duration-300 lg:grid-cols-2">
          {allResults.map((result: WeatherToolResponse, index: number) =>
            result.error ? (
              <WeatherErrorCard
                key={`weather-error-${index}`}
                location={result.error.location}
                error={result.error.message}
                code={result.error.code}
              />
            ) : (
              <WeatherCard key={`weather-${index}`} result={result} />
            ),
          )}
        </div>
        <TimeBadge />
      </ContainerWrapper>
    )
  }

  const CallState = () => {
    const isStuck = stuckToolCalls.has(toolCallId)
    const locationStr = Array.isArray(args?.location)
      ? args?.location.join(', ')
      : (args?.location as string) || 'esta localização'

    if (isStuck) {
      return (
        <ContainerWrapper className="mt-1 flex w-full flex-col">
          <div className="mr-auto max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[73%]">
            <WeatherErrorCard
              location={locationStr}
              error={`Não foi possível obter informações sobre o clima para "${locationStr}"`}
              code="NETWORK_ERROR"
            />
          </div>
          <TimeBadge />
        </ContainerWrapper>
      )
    } else {
      return (
        <ContainerWrapper className="mt-1 flex w-full flex-col">
          <div className="mr-auto rounded-lg bg-primary/10 p-3 text-card-foreground max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[73%]">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="animate-pulse">
                Buscando informações do clima para {locationStr}...
              </span>
            </div>
          </div>
          <TimeBadge />
        </ContainerWrapper>
      )
    }
  }

  const DefaultState = () => (
    <ContainerWrapper className="mt-1 flex w-full flex-col">
      <div className="mr-auto rounded-lg bg-primary/10 p-3 text-card-foreground max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[73%]">
        <div className="flex items-center">
          <MessageLoading className="size-4" />
        </div>
      </div>
      <TimeBadge />
    </ContainerWrapper>
  )

  switch (toolInvocation.state) {
    case 'result':
      return <ResultState />
    case 'call':
      return <CallState />
    default:
      return <DefaultState />
  }
}
