'use client'

import { Bell, Check, Ghost, MessageSquarePlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { toast } from 'sonner'

import { SidebarTriggerComponentMobile } from '@/app/_components/sidebar/sidebar-trigger-mobile'
import { DashboardPageHeader } from '@/components/dashboard'
import { ToggleTheme } from '@/components/theme/toggle-theme'
import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { useChatInstance } from '@/context/chat'
import { useSessionUser } from '@/context/user'
import { useChatStore } from '@/store/chat'
import { formatDistanceToNow } from '@/utils/format'
import { cn } from '@/utils/utils'

function ChatHeader() {
  const router = useRouter()

  const { isGhostChatMode, setToGhostChatMode, resetChatState } = useChatStore()
  const { setMessages } = useChatInstance()
  const { notifications } = useSessionUser()

  const [isOpen, setIsOpen] = React.useState(false)

  const handleGhostChatMode = () => {
    setToGhostChatMode((prev) => !prev)

    toast('', {
      action: (
        <p className="text-sm">
          Chat fantasma:{' '}
          <span
            data-ghost={isGhostChatMode}
            className="font-bold data-[ghost=false]:text-green-400 data-[ghost=true]:text-red-400"
          >
            {!isGhostChatMode ? 'ativado' : 'desativado'}
          </span>
        </p>
      ),
      position: 'top-center',
      duration: 1500,
    })
  }

  const handleCreateNewChat = () => {
    resetChatState()
    setMessages([])
  }

  useHotkeys('shift+n', () => {
    router.push('/')
    handleCreateNewChat()
  })

  useHotkeys('shift+g', () => {
    handleGhostChatMode()
  })

  const unreadNotifications =
    notifications?.filter((noti) => !noti.readAt) || []

  return (
    <DashboardPageHeader className="flex w-full items-center justify-between border-b border-input bg-card pb-[1rem]">
      <div className="ml-2 flex items-center gap-3 transition-all">
        <SidebarTriggerComponentMobile size="icon" variant="outline" />
        <TooltipWrapper content="Chat fantasma (Shift+g)" asChild side="bottom">
          <Button size="icon" onClick={handleGhostChatMode} variant="ghost">
            <Ghost size={16} />
          </Button>
        </TooltipWrapper>
      </div>
      <div className="mr-2 flex items-center gap-2">
        {notifications && notifications.length > 0 && (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button size="icon" className="relative" variant="outline">
                <Bell size={16} />
                <p className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-red-500 text-white">
                  {unreadNotifications.length > 9 ? (
                    <span className="text-[11px]">9+</span>
                  ) : (
                    unreadNotifications.length
                  )}
                </p>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="max-h-[620px] w-80 space-y-1.5 overflow-y-auto rounded-2xl bg-background p-1.5"
              align="end"
            >
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-input bg-card p-2 text-xs hover:bg-primary/10"
                >
                  <div className="flex flex-col justify-center gap-2">
                    <div className="relative flex gap-1">
                      <span>{notification.category}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground/90">
                        {formatDistanceToNow(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm">{notification.content}</p>
                  </div>
                  <Button size="icon" variant="link" className="my-auto">
                    <Check
                      size={16}
                      className={cn('text-green-400', {
                        'text-muted-foreground': notification.readAt,
                      })}
                    />
                  </Button>
                </div>
              ))}
            </PopoverContent>
          </Popover>
        )}
        <Separator orientation="vertical" className="h-4" />

        <TooltipWrapper content="Nova conversa (Shift+n)" asChild>
          <Link href="/">
            <Button onClick={handleCreateNewChat} size="icon" variant="outline">
              <MessageSquarePlus className="size-6" />
            </Button>
          </Link>
        </TooltipWrapper>
        <Separator orientation="vertical" className="h-4" />
        <ToggleTheme />
      </div>
    </DashboardPageHeader>
  )
}

export { ChatHeader }
