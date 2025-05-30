import { Todo } from '@prisma/client'
import { Suspense } from 'react'

import { getTodosAction } from '@/app/api/todo/actions/get-todos'
import { ContainerWrapper } from '@/components/container'
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardPageMain,
} from '@/components/dashboard'
import { ToggleTheme } from '@/components/theme/toggle-theme'

import { TodoCreateForm } from './_components/todo/create-form'
import { TodoDataTable } from './_components/todo/data-table'
import { TodoDataTableFallback } from './_components/todo/data-table-fallback'

export default async function Page() {
  const initialData = await getTodosAction()

  async function refreshTodos(): Promise<Todo[]> {
    'use server'
    return getTodosAction()
  }

  return (
    <DashboardPage>
      <DashboardPageHeader className="flex items-center justify-end border-b border-border bg-card pb-4">
        <div className="mr-2 flex items-center gap-3">
          <TodoCreateForm />
          <ToggleTheme />
        </div>
      </DashboardPageHeader>
      <DashboardPageMain>
        <ContainerWrapper className="mt-8">
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
