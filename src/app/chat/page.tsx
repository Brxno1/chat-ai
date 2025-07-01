import { Suspense } from 'react'

import { Chat } from '@/app/chat/_components/chat'
import { ChatFallback } from '@/app/chat/_components/chat/chat-fallback'
import { ContainerWrapper } from '@/components/container'
import { DashboardPage, DashboardPageMain } from '@/components/dashboard'

import { ChatHeader } from './_components/ui/header'

export default async function ChatPage() {
  return (
    <DashboardPage className="flex h-full w-full max-w-full flex-col">
      <ChatHeader />
      <DashboardPageMain>
        <ContainerWrapper className="h-full min-h-0 flex-1">
          <Suspense fallback={<ChatFallback />}>
            <Chat />
          </Suspense>
        </ContainerWrapper>
      </DashboardPageMain>
    </DashboardPage>
  )
}
