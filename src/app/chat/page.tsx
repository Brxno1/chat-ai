import { Suspense } from 'react'

import { getUserSession } from '@/app/api/user/profile/actions/get-user-session'
import { Chat } from '@/app/chat/_components/chat'
import { ChatFallback } from '@/app/chat/_components/chat-fallback'
import { ContainerWrapper } from '@/components/container'
import { DashboardPage, DashboardPageMain } from '@/components/dashboard'

import { ChatHeader } from './_components/header'

export default async function ChatPage() {
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
