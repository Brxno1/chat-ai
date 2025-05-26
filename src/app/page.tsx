import { cookies } from 'next/headers'
import { Suspense } from 'react'

import { auth } from '@/services/auth'

import { Chat } from '../components/chat-ai/chat'
import { ChatFallback } from '../components/chat-ai/chat-fallback'

export default async function Home() {
  const session = await auth()

  const cookieStore = await cookies()

  const model = cookieStore.get('model')

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Suspense fallback={<ChatFallback modelName={model?.value || 'AI'} />}>
        <Chat modelName={model?.value || 'AI'} initialUser={session?.user} />
      </Suspense>
    </div>
  )
}
