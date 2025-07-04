import { Message } from '@ai-sdk/react'
import { cache, Suspense } from 'react'

import { getChatById } from '@/app/api/chat/actions/get-chat-by-id'
import { getUserSession } from '@/app/api/user/profile/actions/get-user-session'
import { Chat } from '@/app/chat/_components/chat'
import { ContainerWrapper } from '@/components/container'
import { DashboardPage, DashboardPageMain } from '@/components/dashboard'

import { ChatFallback } from '../_components/chat/chat-fallback'
import { ChatHeader } from '../_components/ui/header'

const getChatByIdCached = cache(async (chatId: string, userId: string) => {
  return getChatById(chatId, userId)
})

export default async function ChatPageWithId({
  params,
}: {
  params: Promise<{ chatId: string }>
}) {
  const { chatId } = await params
  const { session } = await getUserSession()

  const userId = session!.user.id

  const { chat } = await getChatByIdCached(chatId, userId)

  return (
    <DashboardPage className="flex h-full w-full max-w-full flex-col">
      <ChatHeader />
      <DashboardPageMain>
        <ContainerWrapper className="h-full min-h-0 flex-1">
          <Suspense fallback={<ChatFallback />}>
            <Chat
              currentChatId={chatId}
              initialMessages={chat!.messages.map((message) => ({
                ...message,
                role: String(message.role).toLowerCase() as Message['role'],
                parts: message.parts || undefined,
              }))}
            />
          </Suspense>
        </ContainerWrapper>
      </DashboardPageMain>
    </DashboardPage>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chatId: string }>
}) {
  const { chatId } = await params
  const { session } = await getUserSession()

  const { success, chat } = await getChatByIdCached(chatId, session!.user.id)

  if (!success && !chat) {
    return {
      title: `Chat`,
      description: 'Chat não encontrado',
    }
  }

  return {
    title: `Chat - ${chat?.title}`,
    description: chat?.createdAt.toLocaleDateString('pt-BR'),
  }
}
