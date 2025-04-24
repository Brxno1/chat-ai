'use client'

import { useSession } from 'next-auth/react'
import { PropsWithChildren } from 'react'

import { UserStoreProvider } from '@/store/user-provider'

export function SessionStoreProvider({ children }: PropsWithChildren) {
  const session = useSession()

  return (
    <>
      <UserStoreProvider session={session} />
      {children}
    </>
  )
}
