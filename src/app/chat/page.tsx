import { cookies } from 'next/headers'
import { Suspense } from 'react'

import { Chat } from '@/app/chat/_components/chat'
import { ChatFallback } from '@/app/chat/_components/chat/chat-fallback'
import { ContainerWrapper } from '@/components/container'
import { DashboardPage, DashboardPageMain } from '@/components/dashboard'
import { ChatProvider } from '@/context/chat'

import { ChatHeader } from './_components/ui/header'

export default async function ChatPage() {
  const cookieStore = await cookies()
  const model = cookieStore.get('ai-model-id')

  return (
    <DashboardPage className="flex h-full w-full max-w-full flex-col">
      <ChatHeader />
      <DashboardPageMain>
        <ContainerWrapper className="h-full min-h-0 flex-1">
          <Suspense fallback={<ChatFallback />}>
            <ChatProvider cookieModel={model!.value}>
              <Chat />
            </ChatProvider>
          </Suspense>
        </ContainerWrapper>
      </DashboardPageMain>
    </DashboardPage>
  )
}
