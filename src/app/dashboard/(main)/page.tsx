import { Todo } from '@prisma/client'

import { actionGetTodos } from '@/app/api/todo/actions/get-todos'
import { ChartDemoOne } from '@/components/chart-demo-one'
import { ChartDemoThree } from '@/components/chart-demo-three'
import { ChartDemoTwo } from '@/components/chart-demo-two'
import { ContainerWrapper } from '@/components/container'
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardPageMain,
} from '@/components/dashboard'
import { ToggleTheme } from '@/components/theme/toggle-theme'

import TodoCreateForm from './_components/todo/todo-create-form'
import { TodoDataTable } from './_components/todo/todo-data-table'

export default async function Page() {
  const initialData = await actionGetTodos()

  async function refreshTodos(): Promise<Todo[]> {
    'use server'
    return actionGetTodos()
  }

  return (
    <DashboardPage>
      <DashboardPageHeader className="sticky top-0 z-10 justify-end">
        <ContainerWrapper className="mr-6 flex items-center gap-4">
          <TodoCreateForm />
          <ToggleTheme />
        </ContainerWrapper>
      </DashboardPageHeader>
      <DashboardPageMain className="h-full overflow-auto">
        <ContainerWrapper className="grid grid-cols-3 gap-4">
          <ChartDemoOne />
          <ChartDemoTwo />
          <ChartDemoThree />
        </ContainerWrapper>
        <ContainerWrapper className="my-8 py-6">
          <TodoDataTable
            initialData={initialData}
            refreshTodos={refreshTodos}
          />
        </ContainerWrapper>
      </DashboardPageMain>
    </DashboardPage>
  )
}
