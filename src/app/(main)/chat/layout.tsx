import type { Metadata } from 'next'
import { PropsWithChildren } from 'react'

import { auth } from '@/services/auth'

import { ChatWrapperLayout } from './_components/chat-wrapper-layout'

export const metadata: Metadata = {
  title: 'Chat IA',
  description: 'Chat com o inteligência artificial',
}

export default async function ChatLayout({ children }: PropsWithChildren) {
  const session = await auth()

  return (
    <ChatWrapperLayout initialUser={session?.user}>
      {children}
    </ChatWrapperLayout>
  )
}
