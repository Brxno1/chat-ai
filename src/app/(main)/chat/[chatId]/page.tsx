import { redirect } from 'next/navigation'

import { Chat } from '@/app/(main)/chat/_components/chat'
import { getChatById } from '@/app/api/chat/actions/get-chat-by-id'
import { getUserSession } from '@/app/api/user/profile/actions/get-user-session'

export default async function ChatPage({
  params,
}: {
  params: { chatId: string }
}) {
  const { chatId } = params
  const { session } = await getUserSession()

  if (!session?.user) {
    redirect('/auth')
  }

  const { success } = await getChatById(chatId, session.user.id)

  if (!success) {
    console.log('chat not found')
    redirect('/chat')
  }

  return (
    <div className="h-full w-full">
      <Chat user={session.user} initialChatId={chatId} />
    </div>
  )
}
