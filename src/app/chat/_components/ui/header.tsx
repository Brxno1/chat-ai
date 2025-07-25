'use client'

import { Ghost, MessageSquarePlus } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { SidebarTriggerComponentMobile } from '@/app/_components/sidebar/sidebar-trigger-mobile'
import { DashboardPageHeader } from '@/components/dashboard'
import { ToggleTheme } from '@/components/theme/toggle-theme'
import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useChatStore } from '@/store/chat'

function ChatHeader() {
  const { isGhostChatMode, setToGhostChatMode, resetChatState } = useChatStore()

  const handleGhostChatMode = () => {
    setToGhostChatMode(!isGhostChatMode)
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
  }

  return (
    <DashboardPageHeader className="flex w-full items-center justify-between border-b border-input bg-card pb-[1rem]">
      <div className="ml-2 flex items-center gap-3 transition-all">
        <SidebarTriggerComponentMobile variant="ghost" size="icon" />
        <TooltipWrapper content="Chat fantasma" asChild side="bottom">
          <Button variant="ghost" size="icon" onClick={handleGhostChatMode}>
            <Ghost size={16} />
          </Button>
        </TooltipWrapper>
      </div>
      <div className="mr-2 flex items-center gap-2">
        <TooltipWrapper content="Nova conversa" asChild>
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
