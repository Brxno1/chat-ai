'use client'

import { Message } from '@ai-sdk/react'
import { ChevronDown, Trash } from 'lucide-react'
import { useId, useState } from 'react'

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
import { useUser } from '@/context/user-provider'
import { formatDateToLocaleWithHour } from '@/utils/format'
import { cn } from '@/utils/utils'

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

  function extractReasoningFromText(text: string) {
    const thinkMatch = text.match(/<think>([\s\S]*?)<\/think>/i)
    return thinkMatch ? thinkMatch[1].trim() : null
  }

  function removeThinkTags(text: string) {
    return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
  }

  const reasoningParts =
    message.parts?.filter((part) => part.type === 'reasoning') || []

  const textParts = message.parts?.filter((part) => part.type === 'text') || []
  const manualReasoning = textParts
    .map((part) =>
      'text' in part ? extractReasoningFromText(part.text) : null,
    )
    .filter(Boolean)

  return (
    <div className="flex w-full flex-col">
      {message.role === 'assistant' && (
        <ContainerWrapper>
          <Badge variant={'chat'} className="mb-2 hover:bg-transparent">
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
      {message.role === 'assistant' &&
        (reasoningParts.length > 0 || manualReasoning.length > 0) && (
          <ContainerWrapper>
            <AIReasoning isStreaming={isStreaming} defaultOpen={isStreaming}>
              <AIReasoningTrigger
                title="Raciocínio"
                className="text-muted-foreground transition-colors hover:text-foreground"
              />
              <AIReasoningContent>
                {/* eslint-disable */}
                {reasoningParts
                  .map((p) => ('reasoning' in p ? p.reasoning : ''))
                  .join('\n\n')
                }
                {/* eslint-enable- */}
              </AIReasoningContent>
            </AIReasoning>
          </ContainerWrapper>
        )}
      {message.parts?.map((part) => {
        switch (part.type) {
          case 'text':
            return (
              <ContainerWrapper key={id} className="mb-4 flex w-full flex-col">
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
                      'ml-auto bg-message text-accent':
                        message.role === 'user',
                      'mr-auto bg-card text-card-foreground': message.role === 'assistant',
                    },
                  )}
                >
                  <AIResponse>
                    {part.type === 'text' && 'text' in part
                      ? removeThinkTags(part.text)
                      : ''}
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
          default:
            return null
        }
      })}
    </div>
  )
}
