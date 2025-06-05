'use client'

import { User } from 'next-auth'

import { MainSidebarContent } from '../../_components/sidebar/main-sidebar'

type ContainerLayoutProps = {
  children: React.ReactNode
  initialUser?: User
  maxWidth?: string
}

export function DashboardWrapperLayout({
  children,
  initialUser,
}: ContainerLayoutProps) {
  return (
    <div className="flex w-full justify-center overflow-hidden">
      <main className="relative flex h-screen min-h-0 w-full flex-row border border-border transition-all">
        <div className="h-screen">
          <MainSidebarContent initialUser={initialUser!} />
        </div>
        <div
          className="flex min-h-0 w-full flex-col overflow-auto"
          aria-label="Conteúdo principal"
        >
          {children}
        </div>
      </main>
    </div>
  )
}
