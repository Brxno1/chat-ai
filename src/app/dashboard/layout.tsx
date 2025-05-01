import type { Metadata } from 'next'
import { PropsWithChildren } from 'react'

import { ContainerLayout } from './(main)/_components/sidebar/container-layout'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Gerencie suas tarefas com facilidade',
}

export default async function DashboardLayout({ children }: PropsWithChildren) {
  return <ContainerLayout>{children}</ContainerLayout>
}
