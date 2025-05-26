import type { Metadata } from 'next'
import { PropsWithChildren } from 'react'

import { auth } from '@/services/auth'

import { DashboardContainerLayout } from './_components/sidebar/container-layout'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Gerencie suas tarefas com facilidade',
}

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const session = await auth()

  return (
    <DashboardContainerLayout initialUser={session?.user}>
      {children}
    </DashboardContainerLayout>
  )
}
