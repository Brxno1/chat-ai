import type { Metadata } from 'next'
import { PropsWithChildren } from 'react'

import { DashboardSidebarContent } from '../_components/sidebar/dashboard-sidebar'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Gerencie suas tarefas com facilidade',
}

export default async function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex w-full justify-center overflow-hidden">
      <main className="relative flex h-screen min-h-0 w-full flex-row border border-border transition-all">
        <div className="h-screen">
          <DashboardSidebarContent />
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
