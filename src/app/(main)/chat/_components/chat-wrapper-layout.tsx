'use client'

import { User } from 'next-auth'
import React from 'react'

import { ChatSidebarContent } from './chat-sidebar'

type ChatWrapperLayoutProps = {
  children: React.ReactNode
  initialUser?: User
}

export function ChatWrapperLayout({
  children,
  initialUser,
}: ChatWrapperLayoutProps) {
  return (
    <div className="flex h-screen w-full justify-center overflow-hidden">
      <main className="relative grid h-screen min-h-0 w-full max-w-full grid-cols-[minmax(4rem,auto)_1fr] space-x-px border transition-all">
        <div className="h-screen">
          <ChatSidebarContent initialUser={initialUser!} />
        </div>
        <div className="flex min-h-0 flex-col" aria-label="Conteúdo principal">
          {children}
        </div>
      </main>
    </div>
  )
}
