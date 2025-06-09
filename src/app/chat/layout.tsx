import type { Metadata } from 'next'
import { PropsWithChildren } from 'react'

import { ChatSidebar } from '@/app/_components/sidebar/chat-sidebar'

import { getChats } from '../api/chat/actions/get-chats'

export const metadata: Metadata = {
  title: 'Chat',
  description: 'Converse com o seu assistente',
}

export default async function ChatLayout({ children }: PropsWithChildren) {
  const chats = await getChats()

  const refreshChats = async () => {
    'use server'

    const chats = await getChats()

    return chats
  }

  return (
    <div className="flex w-full justify-center overflow-hidden">
      <main className="relative flex h-screen min-h-0 w-full flex-row border border-border transition-all">
        <div className="h-screen">
          <ChatSidebar refreshChats={refreshChats} chats={chats} />
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
