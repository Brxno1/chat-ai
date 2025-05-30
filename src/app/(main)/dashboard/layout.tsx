import type { Metadata } from 'next'
import { PropsWithChildren } from 'react'

import { auth } from '@/services/auth'

import { MainWrapperLayout } from '../_components/wrapper-layout'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Gerencie suas tarefas com facilidade',
}

export default async function MainLayout({ children }: PropsWithChildren) {
  const session = await auth()

  return (
    <MainWrapperLayout initialUser={session?.user}>
      {children}
    </MainWrapperLayout>
  )
}
