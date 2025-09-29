import { getUserSession } from '@/actions/user/profile/get-user-session'
import { Providers } from './globals-providers'
import { cookies } from 'next/headers'
import { getChatsAction } from '@/actions/chat/get-chats'
import { getNotificationsAction } from '@/actions/notifications/get-notifications'

type InitializerProps = {
  children: React.ReactNode
}

export async function Initializer({ children }: InitializerProps) {
  const cookieStore = await cookies()
  const model = cookieStore.get('ai-model')?.value
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  const { session } = await getUserSession()
  const { chats } = await getChatsAction()
  const { notifications } = await getNotificationsAction()

  return (
    <Providers
      initialChats={chats}
      initialSession={session}
      initialUser={session?.user}
      defaultOpen={defaultOpen}
      model={model}
      notifications={notifications}
    >
      {children}
    </Providers>
  )
}