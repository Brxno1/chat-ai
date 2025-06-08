import { getUserSession } from '@/app/api/user/profile/actions/get-user-session'
import { Providers } from './providers'
import { cookies } from 'next/headers'
import { getChats } from '@/app/api/chat/actions/get-chats'

type InitializerProps = {
  children: React.ReactNode
}

export async function Initializer({ children }: InitializerProps) {
  const { session } = await getUserSession()

  const chats = await getChats()

  const refreshChats = async () => {
    'use server'

    const chats = await getChats()

    return chats
  }

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  return (
    <Providers
      chats={chats}
      initialSession={session}
      initialUser={session?.user}
      refreshChats={refreshChats}
      defaultOpen={defaultOpen}>
      {children}
    </Providers>
  )
}