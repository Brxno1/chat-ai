import { Ghost, MessageSquarePlus } from 'lucide-react'
import { headers } from 'next/headers'
import { Suspense } from 'react'

import { Chat } from '@/app/(main)/chat/_components/chat'
import { ChatFallback } from '@/app/(main)/chat/_components/chat-fallback'
import { getUserSession } from '@/app/api/user/profile/actions/get-user-session'
import { ContainerWrapper } from '@/components/container'
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardPageMain,
} from '@/components/dashboard'
import { ComponentSwitchTheme } from '@/components/switch-theme'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { SidebarTriggerComponentMobile } from '../_components/sidebar/sidebar-trigger-mobile'

export default async function PageChat() {
  const { session } = await getUserSession()

  const headersList = await headers()

  const chatId = headersList.get('x-Chat-Id') || undefined

  return (
    <DashboardPage className="flex h-full w-full max-w-full flex-col">
      <DashboardPageHeader className="flex w-full items-center justify-between border-b border-border bg-card pb-[1rem]">
        <div className="ml-6 flex items-center gap-3 transition-all max-sm:ml-2">
          <SidebarTriggerComponentMobile variant="ghost" size="icon" />
          <Button variant="link" size="icon" disabled={false}>
            <Ghost size={16} />
          </Button>
        </div>
        <div className="mr-6 flex items-center gap-3 transition-all max-sm:mr-2">
          <Button
            variant="outline"
            className="flex items-center gap-2 text-sm font-bold"
          >
            <MessageSquarePlus size={16} />
            <span className="transition-all max-sm:hidden">Nova conversa</span>
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <ComponentSwitchTheme />
        </div>
      </DashboardPageHeader>
      <DashboardPageMain>
        <ContainerWrapper className="h-full min-h-0 flex-1">
          <Suspense fallback={<ChatFallback />}>
            <Chat user={session?.user} initialChatId={chatId} />
          </Suspense>
        </ContainerWrapper>
      </DashboardPageMain>
    </DashboardPage>
  )
}
