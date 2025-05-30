import { headers } from 'next/headers'
import { Suspense } from 'react'

import { getUserSession } from '@/app/api/user/profile/actions/get-user-session'
import { Chat } from '@/components/chat-ai/chat'
import { ChatFallback } from '@/components/chat-ai/chat-fallback'
import { SidebarInset } from '@/components/ui/sidebar'

export default async function PageChat() {
  const { session } = await getUserSession()

  const headersList = await headers()

  const chatId = headersList.get('x-Chat-Id') || undefined

  return (
    <SidebarInset className="size-full">
      <Suspense fallback={<ChatFallback />}>
        <Chat user={session?.user} initialChatId={chatId} />
      </Suspense>
    </SidebarInset>
  )
}
