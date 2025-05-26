import { getUserSession } from '@/app/api/user/profile/actions/get-user-session'
import { Providers } from './providers'

type InitializerProps = {
  children: React.ReactNode
}

export async function Initializer({ children }: InitializerProps) {
  const { session } = await getUserSession()

  return (
    <Providers initialSession={session ?? undefined}>
      {children}
    </Providers>
  )
}