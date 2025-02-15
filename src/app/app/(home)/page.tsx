import Container from '@/components/container'
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardPageMain,
} from '@/components/dashboard/page'
import { ToggleTheme } from '@/components/toggle-theme'
import { SidebarTrigger } from '@/components/ui/sidebar'

import TodoCreateForm from './_components/todo-create-form'
import { TodoDataTable } from './_components/todo-data-table'

export default async function Page() {
  return (
    <DashboardPage>
      <DashboardPageHeader>
        <SidebarTrigger />
        <Container className="mr-5 flex items-center gap-4">
          <TodoCreateForm />
          <ToggleTheme />
        </Container>
      </DashboardPageHeader>
      <DashboardPageMain>
        <TodoDataTable />
      </DashboardPageMain>
    </DashboardPage>
  )
}
