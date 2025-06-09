'use client'

import { Message } from 'ai'
import { ChevronDown, Trash } from 'lucide-react'
import { useState } from 'react'

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
import { useUser } from '@/context/user-provider'
import { useChatStore } from '@/store/chat-store'
import { formatDateToLocaleWithHour } from '@/utils/format'
import { formatTextWithStrong } from '@/utils/format-text-strong'
import { truncateText } from '@/utils/truncate-text'
import { cn } from '@/utils/utils'

import { models } from './models'

interface MessageProps {
  message: Message
  modelName: string
  onDeleteMessageChat: (id: string) => void
}

export function Messages({
  message,
  modelName,
  onDeleteMessageChat,
}: MessageProps) {
  const [state, setState] = useState({
    isDeleting: false,
    openDropdown: false,
  })

  const { user } = useUser()

  const { chatIsDeleting } = useChatStore()

  const handleCloseComponent = () => {
    setState((prev) => ({ ...prev, openDropdown: false }))
  }

  function handleDeleteMessageChat(
    ev: React.MouseEvent<HTMLDivElement>,
    id: string,
  ) {
    ev.preventDefault()

    setState((prev) => ({ ...prev, isDeleting: true }))

    setTimeout(() => {
      setState((prev) => ({ ...prev, isDeleting: false }))
      onDeleteMessageChat(id)
    }, 500)
  }

  return (
    <div key={`${message.id}-${new Date()}`} className="flex w-full flex-col">
      <div
        className={cn('mb-1 flex w-fit items-center justify-center gap-1', {
          'ml-auto': message.role === 'user',
          'mr-auto': message.role === 'assistant',
        })}
      >
        {message.role === 'user' ? (
          <>
            <Badge className="bg-transparent p-0 text-sm text-muted-foreground hover:bg-transparent">
              {truncateText(user?.name ?? '', 20)}
            </Badge>
            <Avatar className="mb-1 size-5 rounded-md">
              <AvatarImage src={user?.image ?? ''} />
              <AvatarFallback className="rounded-md">
                {user?.name?.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </>
        ) : (
          <>
            <Avatar className="mb-1 size-5 rounded-md">
              <AvatarImage
                src={`https://img.logo.dev/${models[0].provider}?token=${process.env.NEXT_PUBLIC_LOGO_TOKEN}`}
              />
              <AvatarFallback className="rounded-md">AI</AvatarFallback>
            </Avatar>
            <Badge className="bg-transparent p-0 text-sm text-muted-foreground hover:bg-transparent">
              {modelName}
            </Badge>
          </>
        )}
      </div>
      {message.parts?.map((part) => {
        switch (part.type) {
          case 'text':
            return (
              <ContainerWrapper
                key={`${message.id}-${new Date()}`}
                className="flex w-full flex-col"
              >
                <div
                  className={cn(
                    'group flex max-w-[17rem] items-center justify-center text-wrap rounded-md border bg-message p-1.5 text-left text-sm transition-all sm:max-w-[24rem] sm:text-justify sm:text-base md:max-w-[23rem] lg:max-w-[35rem] xl:max-w-[50rem] 2xl:max-w-[60rem]',
                    {
                      'ml-auto': message.role === 'user',
                      'mr-auto': message.role === 'assistant',
                      'animate-pulse': chatIsDeleting,
                    },
                  )}
                >
                  <p className="px-1.5 text-accent dark:text-accent-foreground">
                    {formatTextWithStrong(part.text)}
                  </p>
                  <DropdownMenu
                    open={state.openDropdown}
                    onOpenChange={() =>
                      setState((prev) => ({
                        ...prev,
                        openDropdown: !prev.openDropdown,
                      }))
                    }
                  >
                    <DropdownMenuTrigger className="mb-auto size-4 cursor-pointer text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <ChevronDown size={16} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="mt-4 flex flex-col items-center gap-2 py-2"
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
                        disabled={state.isDeleting || chatIsDeleting}
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
                        <Trash className="h-4 w-4" />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Badge
                  className={cn(
                    'mt-1 w-fit bg-transparent text-2xs text-muted-foreground hover:bg-transparent dark:border-zinc-900/30',
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
