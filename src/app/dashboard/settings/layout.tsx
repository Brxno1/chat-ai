import type { Metadata } from 'next'
import { PropsWithChildren } from 'react'

export const metadata: Metadata = {
  title: 'Configurações',
}

export default async function RootLayout({ children }: PropsWithChildren) {
  return <>{children}</>
}
