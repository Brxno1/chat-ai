'use client'

import { Ghost, MessageSquarePlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useHotkeys } from 'react-hotkeys-hook'
import { toast } from 'sonner'

import { SidebarTriggerComponentMobile } from '@/app/_components/sidebar/sidebar-trigger-mobile'
import { useSidebar } from '@/components/animate-ui/radix/sidebar'
import { DashboardPageHeader } from '@/components/dashboard'
import { Notifications } from '@/components/notifications'
import { NotificationsMobile } from '@/components/notifications/notification-mobile'
import { ToggleTheme } from '@/components/theme/toggle-theme'
import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useChatInstance } from '@/context/chat'
import { useChatStore } from '@/store/chat'
import { useSessionUser } from '@/context/user'

function ChatHeader() {
  const router = useRouter()
  const { user } = useSessionUser()
  const { isMobile } = useSidebar()

  const isGhostChatMode = useChatStore((state) => state.isGhostChatMode)
  const defineChatToGhostMode = useChatStore(
    (state) => state.defineChatToGhostMode,
  )
  const resetChatState = useChatStore((state) => state.resetChatState)

  const { messages, setMessages } = useChatInstance()

  const hasMessages = messages.length > 0

  const handleGhostChatMode = () => {
    defineChatToGhostMode((prev) => !prev)

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
    setMessages([])
    resetChatState()
    router.push('/')
  }

  useHotkeys('shift+n', () => {
    if (!hasMessages) return

    router.push('/')
    handleCreateNewChat()
  })

  useHotkeys('shift+g', () => {
    handleGhostChatMode()
  })

  return (
    <DashboardPageHeader className="flex w-full items-center justify-between border-b border-input pb-[1rem]">
      <div className="ml-2 flex items-center gap-3 transition-all">
        <SidebarTriggerComponentMobile size="icon" variant="ghost" />
        <TooltipWrapper content="Chat fantasma (Shift+G)" asChild side="bottom">
          <Button size="icon" onClick={handleGhostChatMode} variant="ghost" disabled={!user}>
            <Ghost size={16} />
          </Button>
        </TooltipWrapper>
      </div>
      <div className="mr-2 flex items-center gap-2">
        {isMobile ? <NotificationsMobile /> : <Notifications />}
        <Separator orientation="vertical" className="h-6" />
        <TooltipWrapper
          content="Nova conversa (Shift+n)"
          asChild
          disabled={!hasMessages}
        >
          <Button
            onClick={handleCreateNewChat}
            size="icon"
            variant="ghost"
            className="border border-input"
            disabled={!hasMessages}
          >
            <Link href="/">
              <MessageSquarePlus className="size-6" />
            </Link>
          </Button>
        </TooltipWrapper>
        <Separator orientation="vertical" className="h-6" />
        <ToggleTheme />
      </div>
    </DashboardPageHeader>
  )
}

export { ChatHeader }
