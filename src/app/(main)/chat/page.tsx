import { Ghost, MessageCirclePlus } from 'lucide-react'
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
import { ToggleTheme } from '@/components/theme/toggle-theme'
import { Button } from '@/components/ui/button'

import { Historical } from './_components/historical'

export default async function PageChat() {
  const { session } = await getUserSession()

  const headersList = await headers()

  const chatId = headersList.get('x-Chat-Id') || undefined

  return (
    <DashboardPage className="h-full min-h-0 flex-1">
      <DashboardPageHeader className="flex items-center justify-between border-b border-border bg-card pb-4">
        <div className="ml-6 flex items-center gap-3">
          <Historical disabled={false} />
          <Button variant="link" size="icon" disabled={false}>
            <MessageCirclePlus size={16} />
          </Button>
          <Button variant="link" size="icon" disabled={false}>
            <Ghost size={16} className="text-primary" />
          </Button>
        </div>
        <div className="mr-6">
          <ToggleTheme />
        </div>
      </DashboardPageHeader>
      <DashboardPageMain>
        <ContainerWrapper className="h-full min-h-0 flex-1 p-4">
          <Suspense fallback={<ChatFallback />}>
            <Chat user={session?.user} initialChatId={chatId} />
          </Suspense>
        </ContainerWrapper>
      </DashboardPageMain>
    </DashboardPage>
  )
}
