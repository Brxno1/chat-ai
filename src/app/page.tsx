import { cookies } from 'next/headers'

import { PurposefulSuspense } from '@/components/purposeful-suspense'

import { Chat } from '../components/chat-ai/chat'
import { ChatFallback } from '../components/chat-ai/chat-fallback'

export default async function Home() {
  const cookieStore = await cookies()
  const model = cookieStore.get('model')

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <PurposefulSuspense
        fallback={<ChatFallback modelName={model?.value || 'AI'} />}
        delay={700}
      >
        <Chat modelName={model?.value || 'AI'} />
      </PurposefulSuspense>
    </div>
  )
}
