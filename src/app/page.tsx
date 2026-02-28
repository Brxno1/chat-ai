import { Suspense } from 'react'

import { Chat } from '@/app/chat/_components'
import { ChatFallback } from '@/app/chat/_components/chat-fallback'
import { ContainerWrapper } from '@/components/container'
import { DashboardPage, DashboardPageMain } from '@/components/dashboard'
import { ChatSidebar } from '@/components/sidebar/chat-sidebar'

import { ChatHeader } from './chat/_components/ui/header'

export default async function Home() {
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
                  <Chat />
                </Suspense>
              </ContainerWrapper>
            </DashboardPageMain>
          </DashboardPage>
        </div>
      </main>
    </div>
  )
}
