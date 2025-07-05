import { getUserSession } from '@/app/api/user/profile/actions/get-user-session'
import { Providers } from './providers'
import { cookies } from 'next/headers'
import { getChatsAction } from '@/app/api/chat/actions/get-chats'

type InitializerProps = {
  children: React.ReactNode
}

export async function Initializer({ children }: InitializerProps) {
  const { session } = await getUserSession()

  const { chats } = await getChatsAction()

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  return (
    <Providers
      initialChats={chats}
      initialSession={session}
      initialUser={session?.user}
      defaultOpen={defaultOpen}>
      {children}
    </Providers>
  )
}