import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { getChatById } from '@/app/api/chat/actions/get-chat-by-id'
import { getUserSession } from '@/app/api/user/profile/actions/get-user-session'
import { Chat } from '@/app/chat/_components/chat'
import { ContainerWrapper } from '@/components/container'
import { DashboardPage, DashboardPageMain } from '@/components/dashboard'

import { ChatFallback } from '../_components/chat-fallback'
import { ChatHeader } from '../_components/header'

export default async function ChatPageWithId({
  params,
}: {
  params: Promise<{ chatId: string }>
}) {
  const { chatId } = await params
  const { session } = await getUserSession()

  const { chat } = await getChatById(chatId, session!.user.id)

  return (
    <DashboardPage className="flex h-full w-full max-w-full flex-col">
      <ChatHeader />
      <DashboardPageMain>
        <ContainerWrapper className="h-full min-h-0 flex-1">
          <Suspense fallback={<ChatFallback />}>
            <Chat
              currentChatId={chatId}
              initialMessages={chat!.messages.map((message) => ({
                id: message.id,
                role: message.role.toLowerCase() as 'user' | 'assistant',
                content: message.content,
                createdAt: message.createdAt,
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

  const { success, chat } = await getChatById(chatId, session!.user.id)

  if (!success && !chat) {
    redirect('/chat')
  }

  return {
    title: `Chat - ${chat!.title}`,
    description: chat?.createdAt.toLocaleDateString('pt-BR'),
  }
}
