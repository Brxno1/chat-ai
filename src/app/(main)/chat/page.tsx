import { Suspense } from 'react'

import { Chat } from '@/app/(main)/chat/_components/chat'
import { ChatFallback } from '@/app/(main)/chat/_components/chat-fallback'
import { getUserSession } from '@/app/api/user/profile/actions/get-user-session'
import { ContainerWrapper } from '@/components/container'
import { DashboardPage, DashboardPageMain } from '@/components/dashboard'

import { ChatHeader } from './_components/header'

export default async function PageChat() {
  const { session } = await getUserSession()

  return (
    <DashboardPage className="flex h-full w-full max-w-full flex-col">
      <ChatHeader />
      <DashboardPageMain>
        <ContainerWrapper className="h-full min-h-0 flex-1">
          <Suspense fallback={<ChatFallback />}>
            <Chat user={session?.user} />
          </Suspense>
        </ContainerWrapper>
      </DashboardPageMain>
    </DashboardPage>
  )
}
