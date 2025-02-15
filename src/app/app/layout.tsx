import type { Metadata } from 'next'
import { PropsWithChildren } from 'react'

import { ContainerLayout } from './_components/container-layout'

export const metadata: Metadata = {
  title: 'Tarefas',
  description: 'Gerencie suas tarefas com facilidade',
}

export default async function RootLayout({ children }: PropsWithChildren) {
  return <ContainerLayout>{children}</ContainerLayout>
}
