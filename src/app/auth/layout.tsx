import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Faça login para continuar',
  description: 'Acesse sua conta para que possa criar suas tarefas.',
}

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
