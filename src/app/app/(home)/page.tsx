import { getTodos } from '@/app/(http)/get-todos'
import { ContainerWrapper } from '@/components/container'
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardPageMain,
} from '@/components/dashboard'
import { ToggleTheme } from '@/components/theme/toggle-theme'
import { auth } from '@/services/auth'

import TodoCreateForm from './_components/todo/todo-create-form'
import { TodoDataTable } from './_components/todo/todo-data-table'

export default async function Page() {
  const session = await auth()

  const initialData = await getTodos({ id: session!.user.id })

  return (
    <DashboardPage>
      <DashboardPageHeader className="justify-end">
        <ContainerWrapper className="mr-6 flex items-center gap-4">
          <TodoCreateForm user={session!.user} />
          <ToggleTheme />
        </ContainerWrapper>
      </DashboardPageHeader>
      <DashboardPageMain>
        <TodoDataTable initialData={initialData} user={session!.user} />
      </DashboardPageMain>
    </DashboardPage>
  )
}
