import { Suspense } from 'react'

import { getTodosAction } from '@/actions/todo/get-todos'
import { ContainerWrapper } from '@/components/container'
import { DashboardPage, DashboardPageMain } from '@/components/dashboard'

import { TodoDataTable } from './_components/todo/data-table'
import { TodoDataTableFallback } from './_components/todo/data-table-fallback'
import { DashboardHeader } from './_components/ui/header'

export default async function Page() {
  const { todos } = await getTodosAction()

  return (
    <DashboardPage className="flex size-full flex-col">
      <DashboardHeader />
      <DashboardPageMain>
        <ContainerWrapper className="h-full min-h-0 flex-1">
          <Suspense fallback={<TodoDataTableFallback />}>
            <TodoDataTable initialData={todos} />
          </Suspense>
        </ContainerWrapper>
      </DashboardPageMain>
    </DashboardPage>
  )
}
