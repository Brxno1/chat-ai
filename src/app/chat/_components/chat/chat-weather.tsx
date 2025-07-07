'use client'

import { Message as UIMessage } from '@ai-sdk/react'
import React from 'react'

import { WeatherToolResponse } from '@/app/api/chat/tools/weather'
import { ContainerWrapper } from '@/components/container'
import { Badge } from '@/components/ui/badge'
import { ToolInvocationResult } from '@/types/tool-results'
import { formatDateToLocaleWithHour, formatLocations } from '@/utils/format'

import {
  LoadingWeather,
  WeatherCard,
  WeatherSkeleton,
} from '../ui/widgets/weather'
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
        return <LoadingWeather location={args.location} />

      default:
        return <WeatherSkeleton location={args.location} />
    }
  }

  return (
    <ContainerWrapper className="mt-1 flex w-full flex-col">
      {renderContent()}
      <TimeBadge />
    </ContainerWrapper>
  )
}
