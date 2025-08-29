import { getUserSession } from '@/app/api/user/profile/actions/get-user-session'
import { Providers } from './globals-providers'
import { cookies } from 'next/headers'
import { getChatsAction } from '@/app/api/chat/actions/get-chats'
import { type Notification } from '@/types/notifications'
import { api } from '@/lib/axios'
import { getJwtToken } from '@/lib/get-jwt-token'

type InitializerProps = {
  children: React.ReactNode
}

export async function Initializer({ children }: InitializerProps) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('authjs.session-token')?.value
  const model = cookieStore.get('ai-model')?.value
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  const { token } = await getJwtToken(sessionToken)
  const { session } = await getUserSession()
  const { chats } = await getChatsAction()

  let notifications: Notification[] = []
  if (sessionToken && session) {
    try {
      const { data } = await api.get<{ notifications: Notification[] }>(`http://localhost:3333/notifications/${session.user.id}/list?page=1&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      notifications = data.notifications ?? []
    } catch (_) {
      notifications = []
    }
  }

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