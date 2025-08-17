import { getUserSession } from '@/app/api/user/profile/actions/get-user-session'
import { Providers } from './providers'
import { cookies } from 'next/headers'
import { getChatsAction } from '@/app/api/chat/actions/get-chats'
import { Notification } from '@/types/notifications'
import { api } from '@/lib/axios'

type InitializerProps = {
  children: React.ReactNode
}

export async function Initializer({ children }: InitializerProps) {
  const { session, token } = await getUserSession()

  const { data } = await api.get(`http://localhost:3333/notifications/${session?.user?.id}/list?page=1&limit=10`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const notificationsData: Notification[] = data?.notifications || []

  const { chats } = await getChatsAction()

  const cookieStore = await cookies()

  const model = cookieStore.get('ai-model')?.value
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  return (
    <Providers
      initialChats={chats}
      initialSession={session}
      initialUser={session?.user}
      defaultOpen={defaultOpen}
      model={model}
      notifications={notificationsData}
    >
      {children}
    </Providers>
  )
}