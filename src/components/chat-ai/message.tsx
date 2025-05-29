'use client'

import { Message } from 'ai'
import { ChevronDown, Trash } from 'lucide-react'
import { useState } from 'react'

import { ContainerWrapper } from '@/components/container'
import { CopyTextComponent } from '@/components/copy-text-component'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSessionStore } from '@/store/user-store'
import { formatTextWithStrong } from '@/utils/format-text-strong'
import { truncateText } from '@/utils/truncate-text'
import { cn } from '@/utils/utils'

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
  const user = useSessionStore((state) => state.user)

  const [state, setState] = useState({
    isDeleting: false,
    openDropdown: false,
  })

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
    <div
      key={`${message.id}-${new Date()}`}
      className="group flex w-full flex-col"
    >
      <div
        className={cn(
          'mb-1 flex w-fit max-w-md items-center justify-center gap-2 rounded-md',
          {
            'ml-auto': message.role === 'user',
            'mr-auto': message.role === 'assistant',
          },
        )}
      >
        <Badge className="bg-transparent text-sm font-semibold text-foreground hover:bg-transparent">
          {['user'].includes(message.role)
            ? truncateText(user?.name ?? '', 20)
            : modelName}
        </Badge>
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
                    'flex max-w-[20rem] items-center justify-between text-wrap rounded-md bg-secondary-foreground p-2',
                    {
                      'ml-auto': message.role === 'user',
                      'mr-auto': message.role === 'assistant',
                    },
                  )}
                >
                  <p className="size-fit max-w-md text-wrap rounded-md px-2 text-background">
                    {formatTextWithStrong(part.text)}
                  </p>
                  <DropdownMenu
                    open={state.openDropdown}
                    onOpenChange={() =>
                      setState((prev) => ({ ...prev, openDropdown: !prev.openDropdown }))
                    }
                  >
                    <DropdownMenuTrigger asChild>
                      <ChevronDown className="mb-auto h-4 w-4 cursor-pointer text-background opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="mt-4 flex flex-col items-center gap-2 py-2"
                      side="bottom"
                    >
                      <DropdownMenuItem className="flex cursor-pointer items-center justify-center">
                        <CopyTextComponent
                          textForCopy={part.text}
                          onCloseComponent={handleCloseComponent}
                        />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={state.isDeleting}
                        onClick={(ev) =>
                          handleDeleteMessageChat(ev, message.id)
                        }
                        className={cn('cursor-pointer', {
                          'animate-pulse text-red-500': state.isDeleting,
                        })}
                      >
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
                  {new Intl.DateTimeFormat(navigator.language, {
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(message.createdAt!))}
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
