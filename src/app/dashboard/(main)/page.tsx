import { Todo } from '@prisma/client'
import { Suspense } from 'react'

import { actionGetTodos } from '@/app/api/todo/actions/get-todos'
import { ChartDemoOne } from '@/components/chart-demo-one'
import { ContainerWrapper } from '@/components/container'
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardPageMain,
} from '@/components/dashboard'
import { ToggleTheme } from '@/components/theme/toggle-theme'

import TodoCreateForm from './_components/todo/create-form'
import { TodoDataTable } from './_components/todo/data-table'
import { TodoDataTableFallback } from './_components/todo/data-table-fallback'

export default async function Page() {
  const initialData = await actionGetTodos()

  async function refreshTodos(): Promise<Todo[]> {
    'use server'
    return actionGetTodos()
  }

  return (
    <DashboardPage className="overflow-hidden">
      <DashboardPageHeader className="sticky top-0 z-10 flex w-full items-center justify-end gap-3 bg-muted px-6 py-3 drop-shadow-md dark:bg-background">
        <TodoCreateForm />
        <ToggleTheme />
      </DashboardPageHeader>
      <DashboardPageMain className="h-full overflow-auto">
        <ContainerWrapper className="grid grid-cols-3 gap-4">
          <ChartDemoOne />
          <ChartDemoOne />
          <ChartDemoOne />
        </ContainerWrapper>
        <ContainerWrapper className="mb-6 mt-20 py-4">
          <Suspense fallback={<TodoDataTableFallback />}>
            <TodoDataTable
              initialData={initialData}
              refreshTodos={refreshTodos}
            />
          </Suspense>
        </ContainerWrapper>
      </DashboardPageMain>
    </DashboardPage>
  )
}
