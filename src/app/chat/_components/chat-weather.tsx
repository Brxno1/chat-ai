'use client'

import type { UIMessage } from 'ai'
import React from 'react'

import { ContainerWrapper } from '@/components/container'
import { Badge } from '@/components/ui/badge'
import { ChatMessage } from '@/types/chat'
import { ToolInvocationResult } from '@/types/tool-results'
import { WeatherToolResponse } from '@/types/weather'
import { formatDateToLocaleWithHour, formatLocations } from '@/utils/format'

import {
  LoadingWeather,
  WeatherCard,
  WeatherSkeleton,
} from './ui/widgets/weather'
import { WeatherErrorCard } from './ui/widgets/weather/weather-error'

interface ChatWeatherProps {
  toolInvocation: ToolInvocationResult<'getWeather'>
  message: UIMessage & Partial<ChatMessage>
}

export function ChatWeather({ toolInvocation, message }: ChatWeatherProps) {
  const [stuckToolIds, setStuckToolIds] = React.useState<Set<string>>(new Set())
  const { toolCallId, state } = toolInvocation
  const args = toolInvocation.args ?? toolInvocation.input
  const result = toolInvocation.result ?? toolInvocation.output

  React.useEffect(() => {
    if (!message.parts) return

    const toolCalls = message.parts
      .filter((part) => part.type.startsWith('tool-'))
      .map(
        (part) =>
          part as { toolCallId: string; toolName: string; state: string },
      )
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
      {formatDateToLocaleWithHour(
        message.createdAt ??
          ((message.metadata as { createdAt?: number })?.createdAt
            ? new Date((message.metadata as { createdAt?: number }).createdAt!)
            : undefined),
      )}
    </Badge>
  )

  const renderContent = () => {
    const locations = args?.location ?? []

    // v6 states: 'input-streaming', 'call', 'output-available', 'output-denied', 'done'
    const hasResult =
      state === 'result' || state === 'output-available' || state === 'done'
    const isLoading = state === 'call' || state === 'input-streaming'

    if (hasResult && result) {
      const resultArray = Array.isArray(result) ? result : [result]
      return (
        <div className="mr-auto grid grid-cols-1 gap-2.5 transition-all duration-300 lg:grid-cols-2">
          {resultArray.map(
            (weatherResult: WeatherToolResponse, index: number) =>
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
    }

    if (isLoading) {
      if (stuckToolIds.has(toolCallId)) {
        return (
          <div className="mr-auto max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[73%]">
            <WeatherErrorCard
              location={formatLocations(locations)}
              error={`Não foi possível obter os dados meteorológicos para ${formatLocations(locations)}. Por favor, tente novamente ou verifique se o nome da localização está correto.`}
              code="NETWORK_ERROR"
            />
          </div>
        )
      }
      return <LoadingWeather location={locations} />
    }

    return <WeatherSkeleton location={locations} />
  }

  return (
    <ContainerWrapper className="mt-1 flex w-full flex-col">
      {renderContent()}
      <TimeBadge />
    </ContainerWrapper>
  )
}
