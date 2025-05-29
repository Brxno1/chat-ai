import { getUserSession } from '@/app/api/user/profile/actions/get-user-session'
import { Providers } from './providers'
import { cookies } from 'next/headers'

type InitializerProps = {
  children: React.ReactNode
}

export async function Initializer({ children }: InitializerProps) {
  const { session } = await getUserSession()

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  return (
    <Providers initialSession={session ?? undefined} defaultOpen={defaultOpen}>
      {children}
    </Providers>
  )
}