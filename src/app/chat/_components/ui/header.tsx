'use client'

import { Ghost, MessageSquarePlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useHotkeys } from 'react-hotkeys-hook'
import { toast } from 'sonner'

import { SidebarTriggerComponentMobile } from '@/app/_components/sidebar/sidebar-trigger-mobile'
import { DashboardPageHeader } from '@/components/dashboard'
import { Notifications } from '@/components/notifications'
import { ToggleTheme } from '@/components/theme/toggle-theme'
import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useChatInstance } from '@/context/chat'
import { useChatStore } from '@/store/chat'

function ChatHeader() {
  const router = useRouter()

  const { isGhostChatMode, setToGhostChatMode, resetChatState } = useChatStore()
  const { setMessages } = useChatInstance()

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
        <Notifications />
        <Separator orientation="vertical" className="h-6" />

        <TooltipWrapper content="Nova conversa (Shift+n)" asChild>
          <Link href="/">
            <Button onClick={handleCreateNewChat} size="icon" variant="ghost">
              <MessageSquarePlus className="size-6" />
            </Button>
          </Link>
        </TooltipWrapper>
        <Separator orientation="vertical" className="h-6" />
        <ToggleTheme />
      </div>
    </DashboardPageHeader>
  )
}

export { ChatHeader }
