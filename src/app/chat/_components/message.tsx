'use client'

import { Message } from '@ai-sdk/react'
import { ChevronDown, Trash } from 'lucide-react'
import { useEffect, useId, useState } from 'react'

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
import { MessageLoading } from '@/components/ui/message-loading'
import { useUser } from '@/context/user-provider'
import { formatDateToLocaleWithHour } from '@/utils/format'
import { cn } from '@/utils/utils'

import { Weather } from './weather'

interface MessageProps {
  message: Message
  modelName: string
  modelProvider: string
  onDeleteMessageChat: (id: string) => void
  isStreaming?: boolean
}

export function Messages({
  message,
  modelName,
  modelProvider,
  onDeleteMessageChat,
  isStreaming = false,
}: MessageProps) {
  const [state, setState] = useState({
    isDeleting: false,
    openDropdown: false,
  })

  const [stuckToolCalls, setStuckToolCalls] = useState<Set<string>>(new Set())

  const id = useId()

  const { user } = useUser()

  const handleCloseComponent = () => {
    setState((state) => ({ ...state, openDropdown: false }))
  }

  function handleDeleteMessageChat(
    ev: React.MouseEvent<HTMLDivElement>,
    id: string,
  ) {
    ev.preventDefault()

    setState((state) => ({ ...state, isDeleting: true }))

    setTimeout(() => {
      setState((state) => ({ ...state, isDeleting: false }))
      onDeleteMessageChat(id)
    }, 500)
  }

  const reasoningParts =
    message.parts?.filter((part) => part.type === 'reasoning') || []

  useEffect(() => {
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

  return (
    <div className="flex w-full flex-col">
      {message.role === 'assistant' && (
        <ContainerWrapper>
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
        </ContainerWrapper>
      )}
      {message.role === 'assistant' && reasoningParts.length > 0 && (
        <ContainerWrapper>
          <AIReasoning isStreaming={isStreaming} defaultOpen={false}>
            <AIReasoningTrigger
              title="Raciocínio"
              className="text-muted-foreground transition-colors hover:text-foreground"
            />
            {/* eslint-disable */}
            <AIReasoningContent>
              {reasoningParts
                .map((p) => ('reasoning' in p ? p.reasoning : ''))
                .join('\n\n')
              }
            </AIReasoningContent>
            {/* eslint-enable- */}
          </AIReasoning>
        </ContainerWrapper>
      )}
      {message.parts?.map((part, partIndex) => {
        switch (part.type) {
          case 'text':
            if (!part.text || part.text.trim() === '') {
              return null
            }

            return (
              <ContainerWrapper key={`${id}-text-${partIndex}`} className="flex w-full flex-col">
                {message.role === 'user' && (
                  <div className="ml-auto flex w-fit items-center justify-center">
                    <Badge variant={'chat'} className="hover:bg-transparent">
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
                  </div>
                )}
                <div
                  className={cn(
                    'group inline-flex items-center justify-center gap-1 overflow-y-auto rounded-lg p-1 text-accent transition-all dark:text-accent-foreground max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[73%]',
                    {
                      'ml-auto bg-message dark:bg-primary/10 text-accent':
                        message.role === 'user',
                      'mr-auto bg-primary/10 text-card-foreground': message.role === 'assistant',
                    },
                  )}
                >
                  <AIResponse>
                    {part.text}
                  </AIResponse>
                  <DropdownMenu
                    open={state.openDropdown}
                    onOpenChange={() =>
                      setState((prev) => ({
                        ...prev,
                        openDropdown: !prev.openDropdown,
                      }))
                    }
                  >
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
                      <DropdownMenuItem
                        disabled={state.isDeleting}
                        onClick={(ev) =>
                          handleDeleteMessageChat(ev, message.id)
                        }
                        className={cn(
                          'flex cursor-pointer items-center gap-2',
                          {
                            'animate-pulse text-red-500': state.isDeleting,
                          },
                        )}
                      >
                        <span className="text-xs">Excluir</span>
                        <Trash size={16} />
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
                  {formatDateToLocaleWithHour(new Date(message.createdAt!))}
                </Badge>
              </ContainerWrapper>
            )
          case 'tool-invocation':
            const { toolInvocation } = part

            if (toolInvocation.toolName === 'displayWeather' && toolInvocation.state === 'result') {
              const { weather, temperature, location } = toolInvocation.result

              return (
                <ContainerWrapper key={`${id}-tool-${partIndex}`} className="mt-1 flex w-full flex-col">
                  <div className="mr-auto max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[73%]">
                    <Weather
                      temperature={temperature}
                      weather={weather}
                      location={location}
                    />
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

            if (toolInvocation.toolName === 'displayWeather' && toolInvocation.state === 'call' || toolInvocation.state === 'partial-call') {
              const isStuck = stuckToolCalls.has(toolInvocation.toolCallId)

              if (isStuck) {
                return (
                  <ContainerWrapper key={`${id}-tool-error-${partIndex}`} className="mt-1 flex w-full flex-col">
                    <div className="mr-auto max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[73%]">
                      <div className="relative min-w-[280px] max-w-[320px] overflow-hidden rounded-2xl border border-red-200 bg-red-50 shadow-lg dark:border-red-800 dark:bg-red-950/20">
                        <div className="relative space-y-4 p-6">
                          <div className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-300">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span>Erro ao buscar clima</span>
                          </div>

                          <div className="text-sm text-red-600 dark:text-red-400">
                            Não foi possível obter informações sobre o clima para "{toolInvocation.args?.location || 'esta localização'}".
                          </div>

                          <div className="text-xs text-red-500 dark:text-red-500">
                            Verifique se o nome da cidade está correto ou tente uma cidade próxima.
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
                  <ContainerWrapper key={`${id}-tool-loading-${partIndex}`} className="mt-1 flex w-full flex-col">
                    <div className="mr-auto bg-primary/10 text-card-foreground rounded-lg p-3 max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[73%]">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Buscando informações do clima para {toolInvocation.args?.location || 'esta localização'}...</span>
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
              <ContainerWrapper key={`${id}-tool-loading-${partIndex}`} className="mt-1 flex w-full flex-col">
                <div className="mr-auto bg-primary/10 text-card-foreground rounded-lg p-3 max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[73%]">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageLoading />
                    <span>Executando ferramenta...</span>
                  </div>
                </div>
              </ContainerWrapper>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
