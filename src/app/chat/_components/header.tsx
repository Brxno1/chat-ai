'use client'

import { Ghost, MessageSquarePlus } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'

import { SidebarTriggerComponentMobile } from '@/app/_components/sidebar/sidebar-trigger-mobile'
import { DashboardPageHeader } from '@/components/dashboard'
import { ComponentSwitchTheme } from '@/components/switch-theme'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useChatStore } from '@/store/chat-store'

function ChatHeader() {
  const pathname = usePathname()
  const router = useRouter()

  const { onCreateNewChat, isGhostChatMode, setToGhostChatMode, setChatId } =
    useChatStore()

  const handleGhostChatMode = () => {
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
    setToGhostChatMode(!isGhostChatMode)
  }

  const handleCreateNewChat = () => {
    onCreateNewChat()
    router.push('/chat')
  }

  React.useEffect(() => {
    if (!pathname.includes('/chat')) {
      setChatId(undefined)
    }
  }, [pathname])

  return (
    <DashboardPageHeader className="flex w-full items-center justify-between border-b border-border bg-card pb-[1rem]">
      <div className="ml-2 flex items-center gap-3 transition-all">
        <SidebarTriggerComponentMobile variant="ghost" size="icon" />
        <Button variant="link" size="icon" onClick={handleGhostChatMode}>
          <Ghost size={16} />
        </Button>
      </div>
      <div className="mr-6 flex items-center gap-3 transition-all max-sm:mr-2">
        <Button
          variant="outline"
          className="flex items-center gap-2 text-sm font-bold"
          onClick={handleCreateNewChat}
        >
          <MessageSquarePlus size={16} />
          <span className="transition-all max-sm:hidden">Nova conversa</span>
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <ComponentSwitchTheme />
      </div>
    </DashboardPageHeader>
  )
}

export { ChatHeader }
