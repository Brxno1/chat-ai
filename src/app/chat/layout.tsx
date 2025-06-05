import type { Metadata } from 'next'
import { PropsWithChildren } from 'react'

import { getUserSession } from '@/app/api/user/profile/actions/get-user-session'
import { SyncChat } from '@/store/chat/sync-chat'

import { getChats } from '../api/chat/actions/get-chats'
import { ChatWrapperLayout } from './_components/chat-wrapper-layout'

export const metadata: Metadata = {
  title: 'Chat',
  description: 'Converse com o seu assistente',
}

export default async function ChatLayout({ children }: PropsWithChildren) {
  const { session } = await getUserSession()

  const chats = await getChats()

  const refreshChats = async () => {
    'use server'

    const chats = await getChats()

    return chats
  }

  return (
    <ChatWrapperLayout
      initialUser={session?.user}
      refreshChats={refreshChats}
      chats={chats}
    >
      <SyncChat initialChats={chats} />
      {children}
    </ChatWrapperLayout>
  )
}
