'use client'

import { User } from 'next-auth'

import { AppSidebar } from './app-sidebar'

type ContainerLayoutProps = {
  children: React.ReactNode
  initialUser?: User
}

export function DashboardContainerLayout({
  children,
  initialUser,
}: ContainerLayoutProps) {
  return (
    <div className="flex h-screen w-full">
      <AppSidebar initialUser={initialUser} />
      <main
        className="flex w-full flex-1 flex-col overflow-hidden"
        aria-label="Conteúdo principal"
      >
        {children}
      </main>
    </div>
  )
}
