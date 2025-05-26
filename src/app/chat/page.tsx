import { redirect } from 'next/navigation'

import { Chat } from '@/components/chat-ai/chat'
import { auth } from '@/services/auth'

export default async function ChatPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth')
  }

  return <Chat modelName="Claude" initialUser={session.user} />
}
