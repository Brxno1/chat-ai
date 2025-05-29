'use client'

import { User } from 'next-auth'

import { AppSidebar } from './sidebar/app-sidebar'

type ContainerLayoutProps = {
  children: React.ReactNode
  initialUser?: User
}

export function MainWrapperLayout({
  children,
  initialUser,
}: ContainerLayoutProps) {
  return (
    <main className="grid h-screen w-full grid-cols-[minmax(4rem,auto)_1fr] space-x-px transition-all">
      <AppSidebar initialUser={initialUser!} />
      <div
        className="flex flex-col overflow-hidden"
        aria-label="Conteúdo principal"
      >
        {children}
      </div>
    </main>
  )
}
