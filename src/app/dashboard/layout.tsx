import type { Metadata } from 'next'
import { PropsWithChildren } from 'react'

import { getUserSession } from '@/app/api/user/profile/actions/get-user-session'

import { DashboardWrapperLayout } from './_components/wrapper-layout'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Gerencie suas tarefas com facilidade',
}

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const { session } = await getUserSession()

  return (
    <DashboardWrapperLayout initialUser={session?.user}>
      {children}
    </DashboardWrapperLayout>
  )
}
