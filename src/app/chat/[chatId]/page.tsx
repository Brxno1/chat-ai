import { notFound, redirect } from 'next/navigation'

import { Chat } from '@/components/chat-ai/chat'
import { auth } from '@/services/auth'
import { prisma } from '@/services/database/prisma'

export default async function ChatPage({
  params,
}: {
  params: { chatId: string }
}) {
  const { chatId } = params
  const session = await auth()

  if (!session?.user) {
    redirect('/auth')
  }

  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId: session.user.id,
    },
  })

  if (!chat) {
    notFound()
  }

  return <Chat modelName="Claude" initialUser={session.user} chatId={chatId} />
}
