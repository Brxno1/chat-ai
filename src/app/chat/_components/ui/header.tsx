'use client'

import { Bell, Check, Ghost, MessageSquarePlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useHotkeys } from 'react-hotkeys-hook'
import { toast } from 'sonner'

import { SidebarTriggerComponentMobile } from '@/app/_components/sidebar/sidebar-trigger-mobile'
import { DashboardPageHeader } from '@/components/dashboard'
import { ToggleTheme } from '@/components/theme/toggle-theme'
import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { useChatInstance } from '@/context/chat'
import { useSessionUser } from '@/context/user'
import { useChatStore } from '@/store/chat'
import { formatDateToLocaleWithHour } from '@/utils/format'
import { cn } from '@/utils/utils'

function ChatHeader() {
  const router = useRouter()

  const { isGhostChatMode, setToGhostChatMode, resetChatState } = useChatStore()
  const { setMessages } = useChatInstance()
  const { notifications } = useSessionUser()

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

  console.log(notifications)

  return (
    <DashboardPageHeader className="flex w-full items-center justify-between border-b border-input bg-card pb-[1rem]">
      <div className="ml-2 flex items-center gap-3 transition-all">
        <SidebarTriggerComponentMobile variant="ghost" size="icon" />
        <TooltipWrapper content="Chat fantasma (Shift+g)" asChild side="bottom">
          <Button variant="ghost" size="icon" onClick={handleGhostChatMode}>
            <Ghost size={16} />
          </Button>
        </TooltipWrapper>
      </div>
      <div className="mr-2 flex items-center gap-2">
        {notifications && notifications.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={16} />
                <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {unreadNotifications.length}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex flex-col items-start justify-between gap-1">
                    <p>{notification.content}</p>
                    <p>{formatDateToLocaleWithHour(notification.createdAt)}</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Check
                      size={16}
                      className={cn('text-green-500', {
                        'text-zinc-500': notification.readAt,
                      })}
                    />
                  </Button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Separator orientation="vertical" className="h-4" />

        <TooltipWrapper content="Nova conversa (Shift+n)" asChild>
          <Link href="/">
            <Button variant="ghost" onClick={handleCreateNewChat} size="icon">
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
