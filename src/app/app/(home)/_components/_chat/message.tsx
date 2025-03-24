'use client'

import { Message } from 'ai'
import { CheckIcon, ChevronDown, CopyIcon, Trash } from 'lucide-react'
import { Session } from 'next-auth'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { clipboardWriteText } from '@/utils/clipboard-write-text'
import { formatTextWithStrong } from '@/utils/format-text-strong'
import { truncateText } from '@/utils/truncate-text'
import { cn } from '@/utils/utils'

interface MessageChatProps {
  message: Message
  modelName: string
  user: Session['user'] | undefined
  onDeleteMessageChat: (id: string) => void
}

export function MessageChat({
  message,
  user,
  modelName,
  onDeleteMessageChat,
}: MessageChatProps) {
  const [open, setOpen] = useState(false)

  const [state, setState] = useState({
    hasCopied: false,
    isDeleting: false,
  })

  function handleCopyTextChat(
    ev: React.MouseEvent<HTMLDivElement>,
    text: string,
  ) {
    ev.preventDefault()

    clipboardWriteText(text)
    setState((prev) => ({ ...prev, hasCopied: true }))

    setTimeout(() => {
      setState((prev) => ({ ...prev, hasCopied: false }))
      setOpen(false)
    }, 1000)
  }

  function handleDeleteMessageChat(
    ev: React.MouseEvent<HTMLDivElement>,
    id: string,
  ) {
    ev.preventDefault()

    setState((prev) => ({ ...prev, isDeleting: true }))

    setTimeout(() => {
      setOpen(false)
      onDeleteMessageChat(id)
      setState((prev) => ({ ...prev, isDeleting: false }))
    }, 1000)
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
            'mr-auto': message.role === 'system',
          },
        )}
      >
        <Badge className="bg-transparent text-sm font-semibold text-foreground hover:bg-transparent">
          {['user'].includes(message.role)
            ? truncateText(user?.name ?? '', 15)
            : modelName}
        </Badge>
      </div>
      {message.parts?.map((part) => {
        switch (part.type) {
          case 'text':
            return (
              <>
                <div
                  key={`${message.id}-${new Date()}`}
                  className={cn(
                    'flex max-w-[20rem] items-center justify-between text-wrap rounded-md bg-secondary-foreground p-1 dark:bg-foreground',
                    {
                      'ml-auto': message.role === 'user',
                      'mr-auto': message.role === 'system',
                    },
                  )}
                >
                  <p className="h-fit w-fit max-w-md text-wrap rounded-md px-2 text-base font-thin text-background">
                    {formatTextWithStrong(part.text)}
                  </p>
                  <DropdownMenu open={open} onOpenChange={setOpen}>
                    <DropdownMenuTrigger asChild>
                      <ChevronDown className="mb-auto h-4 w-4 cursor-pointer text-background opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="mt-2 flex flex-col items-center"
                      side="bottom"
                    >
                      <DropdownMenuItem
                        onClick={(ev) => handleCopyTextChat(ev, part.text)}
                        className="cursor-pointer"
                        disabled={state.hasCopied}
                      >
                        <div
                          className={cn(
                            'transition-all duration-300',
                            state.hasCopied
                              ? 'scale-100 opacity-100'
                              : 'scale-0 opacity-0',
                          )}
                        >
                          <CheckIcon
                            className="stroke-emerald-500"
                            size={16}
                            aria-hidden="true"
                          />
                        </div>
                        <div
                          className={cn(
                            'absolute transition-all duration-300',
                            state.hasCopied
                              ? 'scale-0 opacity-0'
                              : 'scale-100 opacity-100',
                          )}
                        >
                          <CopyIcon size={16} aria-hidden="true" />
                        </div>
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
              </>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
