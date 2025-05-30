import type { Metadata } from 'next'
import { PropsWithChildren } from 'react'

import { auth } from '@/services/auth'

import { MainWrapperLayout } from '../_components/wrapper-layout'

export const metadata: Metadata = {
  title: 'Chat IA',
  description: 'Chat com o inteligência artificial',
}

export default async function ChatLayout({ children }: PropsWithChildren) {
  const session = await auth()

  return (
    <MainWrapperLayout initialUser={session?.user} maxWidth="1200px">
      {children}
    </MainWrapperLayout>
  )
}
