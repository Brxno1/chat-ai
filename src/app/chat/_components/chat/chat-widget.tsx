import { Message } from '@ai-sdk/react'
import { ToolInvocation } from 'ai'
import React from 'react'

import { ContainerWrapper } from '@/components/container'
import { Badge } from '@/components/ui/badge'
import { MessageLoading } from '@/components/ui/message-loading'
import { formatDateToLocaleWithHour } from '@/utils/format'

import { Weather } from '../ui/widgets/weather'

interface WidgetProps {
  toolInvocation: ToolInvocation
  partIndex: number
  message: Message
}

export function Widget({ toolInvocation, partIndex, message }: WidgetProps) {
  const [stuckToolCalls, setStuckToolCalls] = React.useState<Set<string>>(
    new Set(),
  )

  const id = React.useId()

  React.useEffect(() => {
    if (!message.parts) return

    const toolCalls = message.parts
      .filter((part) => part.type === 'tool-invocation')
      .map((part) => part.toolInvocation)
      .filter(
        (tool) => tool.state === 'call' && tool.toolName === 'displayWeather',
      )

    if (toolCalls.length === 0) return

    const timeout = setTimeout(() => {
      const newStuckCalls = new Set(stuckToolCalls)
      toolCalls.forEach((tool) => {
        newStuckCalls.add(tool.toolCallId)
      })
      setStuckToolCalls(newStuckCalls)
    }, 10000)

    return () => clearTimeout(timeout)
  }, [message.parts, stuckToolCalls])

  if (
    toolInvocation.toolName === 'displayWeather' &&
    toolInvocation.state === 'result'
  ) {
    const results = Array.isArray(toolInvocation.result)
      ? toolInvocation.result
      : [toolInvocation.result]

    const displayResults = results.slice(0, 6)

    return (
      <ContainerWrapper
        key={`${id}-tool-${partIndex}`}
        className="mt-1 flex w-full flex-col"
      >
        <div className="mr-auto grid grid-cols-1 gap-4 transition-all duration-300 max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[73%] lg:grid-cols-2">
          {displayResults.map((result, index) => (
            <Weather
              key={`weather-${index}-${result.location}`}
              temperature={result.temperature}
              weather={result.weather}
              location={result.location}
            />
          ))}
        </div>
        <Badge
          variant={'chat'}
          className="text-xs text-muted-foreground hover:bg-transparent"
        >
          {formatDateToLocaleWithHour(new Date(message.createdAt!))}
        </Badge>
      </ContainerWrapper>
    )
  }

  if (
    toolInvocation.toolName === 'displayWeather' &&
    (toolInvocation.state === 'call' || toolInvocation.state === 'partial-call')
  ) {
    const isStuck = stuckToolCalls.has(toolInvocation.toolCallId)

    if (isStuck) {
      return (
        <ContainerWrapper
          key={`${id}-tool-error-${partIndex}`}
          className="mt-1 flex w-full flex-col"
        >
          <div className="mr-auto max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[73%]">
            <div className="relative min-w-[280px] max-w-[320px] overflow-hidden rounded-2xl border border-red-200 bg-red-50 shadow-lg dark:border-red-800 dark:bg-red-950/20">
              <div className="relative space-y-4 p-6">
                <div className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-300">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <span>Erro ao buscar clima</span>
                </div>

                <div className="text-sm text-red-600 dark:text-red-400">
                  Não foi possível obter informações sobre o clima para "
                  {Array.isArray(toolInvocation.args?.location)
                    ? toolInvocation.args?.location.join(', ')
                    : toolInvocation.args?.location || 'esta localização'}
                  ".
                </div>

                <div className="text-xs text-red-500 dark:text-red-500">
                  Verifique se o nome da cidade está correto ou tente uma cidade
                  próxima.
                </div>
              </div>
            </div>
          </div>
          <Badge
            variant={'chat'}
            className="text-xs text-muted-foreground hover:bg-transparent"
          >
            {formatDateToLocaleWithHour(new Date(message.createdAt!))}
          </Badge>
        </ContainerWrapper>
      )
    } else {
      return (
        <ContainerWrapper
          key={`${id}-tool-loading-${partIndex}`}
          className="mt-1 flex w-full flex-col"
        >
          <div className="mr-auto rounded-lg bg-primary/10 p-3 text-card-foreground max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[73%]">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="animate-pulse">
                Buscando informações do clima para{' '}
                {Array.isArray(toolInvocation.args?.location)
                  ? toolInvocation.args?.location.join(', ')
                  : toolInvocation.args?.location || 'esta localização'}
                ...
              </span>
            </div>
          </div>
          <Badge
            variant={'chat'}
            className="text-xs text-muted-foreground hover:bg-transparent"
          >
            {formatDateToLocaleWithHour(new Date(message.createdAt!))}
          </Badge>
        </ContainerWrapper>
      )
    }
  }
  return (
    <ContainerWrapper
      key={`${id}-tool-loading-${partIndex}`}
      className="mt-1 flex w-full flex-col"
    >
      <div className="mr-auto rounded-lg bg-primary/10 p-3 text-card-foreground max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[73%]">
        <div className="flex items-center">
          <MessageLoading />
        </div>
      </div>
    </ContainerWrapper>
  )
}
