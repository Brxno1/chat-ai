import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache, Suspense } from 'react'

import { ChatSidebar } from '@/app/_components/sidebar/chat-sidebar'
import { getChatById } from '@/app/api/chat/actions/get-chat-by-id'
import { getUserSession } from '@/app/api/user/profile/actions/get-user-session'
import { Chat } from '@/app/chat/_components/chat'
import { ContainerWrapper } from '@/components/container'
import { DashboardPage, DashboardPageMain } from '@/components/dashboard'
import { ChatProvider } from '@/context/chat'

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

  if (!session) {
    redirect('/auth')
  }

  const { id: userId } = session.user

  const { chat } = await getChatByIdCached(chatId, userId)

  if (!chat) {
    redirect('/')
  }

  const cookieStore = await cookies()
  const model = cookieStore.get('ai-model-id')?.value || 'gemini-2.0-flash'

  return (
    <div className="flex w-full justify-center overflow-hidden">
      <main className="relative flex h-screen min-h-0 w-full flex-row border border-border transition-all">
        <div className="h-screen">
          <ChatSidebar />
        </div>
        <div
          className="flex min-h-0 w-full flex-col overflow-auto"
          aria-label="Conteúdo principal"
        >
          <DashboardPage className="flex h-full w-full max-w-full flex-col">
            <ChatHeader />
            <DashboardPageMain>
              <ContainerWrapper className="h-full min-h-0 flex-1">
                <Suspense fallback={<ChatFallback />}>
                  <ChatProvider
                    initialMessages={chat!.messages}
                    currentChatId={chatId}
                    cookieModel={model}
                  >
                    <Chat />
                  </ChatProvider>
                </Suspense>
              </ContainerWrapper>
            </DashboardPageMain>
          </DashboardPage>
        </div>
      </main>
    </div>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chatId: string }>
}) {
  const { chatId } = await params
  const { session } = await getUserSession()

  const { chat } = await getChatByIdCached(chatId, session!.user.id)

  if (!chat || Array.isArray(chat)) {
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
