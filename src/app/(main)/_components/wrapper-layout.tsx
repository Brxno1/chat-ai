'use client'

import { User } from 'next-auth'

import { AppSidebar } from './sidebar/app-sidebar'

type ContainerLayoutProps = {
  children: React.ReactNode
  initialUser?: User
  maxWidth?: string
}

export function MainWrapperLayout({
  children,
  initialUser,
}: ContainerLayoutProps) {
  return (
    <div className="flex w-full">
      <main className="grid w-full grid-cols-[minmax(4rem,auto)_1fr] space-x-px transition-all">
        <div className="transition-opacity duration-200">
          <AppSidebar initialUser={initialUser!} />
        </div>
        <div
          className="flex min-h-0 flex-col overflow-auto"
          aria-label="Conteúdo principal"
        >
          {children}
        </div>
      </main>
    </div>
  )
}
