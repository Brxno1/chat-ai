import type { Metadata } from 'next'
import { PropsWithChildren } from 'react'

export const metadata: Metadata = {
  title: 'Configurações',
}

export default function RootLayout({ children }: PropsWithChildren) {
  return <main className="flex h-screen flex-col">{children}</main>
}
