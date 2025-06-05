'use client'

import { User } from 'next-auth'

import { ChatSidebar } from '@/app/_components/sidebar/chat-sidebar'
import { ChatWithMessages } from '@/app/api/chat/actions/get-chats'

type ChatLayoutProps = {
  children: React.ReactNode
  initialUser?: User
  refreshChats: () => Promise<ChatWithMessages[]>
  chats: ChatWithMessages[]
}

export function ChatWrapperLayout({
  children,
  initialUser,
  refreshChats,
  chats,
}: ChatLayoutProps) {
  return (
    <div className="flex w-full justify-center overflow-hidden">
      <main className="relative flex h-screen min-h-0 w-full flex-row border border-border transition-all">
        <div className="h-screen">
          <ChatSidebar
            initialUser={initialUser!}
            refreshChats={refreshChats}
            chats={chats}
          />
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
