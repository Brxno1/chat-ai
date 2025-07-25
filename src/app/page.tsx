import { cookies } from 'next/headers'
import { Suspense } from 'react'

import { ChatSidebar } from '@/app/_components/sidebar/chat-sidebar'
import { Chat } from '@/app/chat/_components/chat'
import { ChatFallback } from '@/app/chat/_components/chat/chat-fallback'
import { ContainerWrapper } from '@/components/container'
import { DashboardPage, DashboardPageMain } from '@/components/dashboard'
import { ChatProvider } from '@/context/chat'

import { ChatHeader } from './chat/_components/ui/header'

export default async function Home() {
  const cookieStore = await cookies()
  const model = cookieStore.get('ai-model-id')?.value || 'gemini-2.0-flash'

  return (
    <div className="flex w-full justify-center overflow-hidden">
      <main className="relative flex h-screen min-h-0 w-full flex-row border border-border transition-all">
        <div className="h-screen">
          <ChatSidebar />
        </div>
        <div
          className="flex min-h-0 w-full flex-col overflow-auto"
          aria-label="Conteúdo principal"
        >
          <DashboardPage className="flex h-full w-full max-w-full flex-col">
            <ChatHeader />
            <DashboardPageMain>
              <ContainerWrapper className="h-full min-h-0 flex-1">
                <Suspense fallback={<ChatFallback />}>
                  <ChatProvider cookieModel={model}>
                    <Chat />
                  </ChatProvider>
                </Suspense>
              </ContainerWrapper>
            </DashboardPageMain>
          </DashboardPage>
        </div>
      </main>
    </div>
  )
}
