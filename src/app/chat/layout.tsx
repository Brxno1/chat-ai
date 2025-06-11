import type { Metadata } from 'next'
import { PropsWithChildren } from 'react'

import { ChatSidebar } from '@/app/_components/sidebar/chat-sidebar'

export const metadata: Metadata = {
  title: 'Chat',
  description: 'Converse com o seu assistente',
}

export default async function ChatLayout({ children }: PropsWithChildren) {
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
          {children}
        </div>
      </main>
    </div>
  )
}
