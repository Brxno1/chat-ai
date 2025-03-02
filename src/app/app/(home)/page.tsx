import Container from '@/components/container'
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardPageMain,
} from '@/components/dashboard/page'
import { ToggleTheme } from '@/components/theme/toggle-theme'
import { auth } from '@/services/auth'

import { SidebarTriggerComponent } from './_components/sidebar-trigger'
import TodoCreateForm from './_components/todo/todo-create-form'
import { TodoDataTable } from './_components/todo/todo-data-table'

export default async function Page() {
  const session = await auth()

  return (
    <DashboardPage>
      <DashboardPageHeader>
        <SidebarTriggerComponent />
        <Container className="mr-5 flex items-center gap-4">
          <TodoCreateForm user={session!.user} />
          <ToggleTheme />
        </Container>
      </DashboardPageHeader>
      <DashboardPageMain>
        <TodoDataTable />
      </DashboardPageMain>
    </DashboardPage>
  )
}
