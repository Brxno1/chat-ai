import { SidebarTriggerComponentMobile } from '@/components/sidebar/sidebar-trigger-mobile'
import { DashboardPageHeader } from '@/components/dashboard'
import { Notifications } from '@/components/notifications'
import { ToggleTheme } from '@/components/theme/toggle-theme'
import { Separator } from '@/components/ui/separator'

import { TodoCreateForm } from '../todo/actions-components/create-todo'

export function DashboardHeader() {
  return (
    <DashboardPageHeader className="relative flex w-full items-center justify-end border-b border-input pb-[1rem]">
      <SidebarTriggerComponentMobile
        variant="ghost"
        size="icon"
        className="absolute left-6 top-1/2 -translate-y-1/2"
      />
      <div className="mr-2 flex items-center gap-3">
        <Notifications />
        <Separator orientation="vertical" className="h-6" />
        <TodoCreateForm />
        <Separator orientation="vertical" className="h-6" />
        <ToggleTheme />
      </div>
    </DashboardPageHeader>
  )
}
