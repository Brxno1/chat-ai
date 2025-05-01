import { cookies } from 'next/headers'

import { PurposefulSuspense } from '@/components/purposeful-suspense'

import { Chat } from './dashboard/(main)/_components/ai/chat'
import { ChatFallback } from './dashboard/(main)/_components/ai/chat-fallback'

export default async function Home() {
  const cookieStore = await cookies()
  const aiModel = cookieStore.get('aiModel')

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <PurposefulSuspense fallback={<ChatFallback />} delay={500}>
        <Chat modelName={aiModel?.value || 'AI'} />
      </PurposefulSuspense>
    </div>
  )
}
