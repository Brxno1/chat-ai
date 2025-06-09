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
import { Separator } from '@/components/ui/separator'

import { SidebarTriggerComponentMobile } from '../_components/sidebar/sidebar-trigger-mobile'
import { TodoCreateForm } from './_components/todo/actions-components/create-todo'
import { TodoDataTable } from './_components/todo/data-table'
import { TodoDataTableFallback } from './_components/todo/data-table-fallback'

export default async function Page() {
  const initialData = await getTodosAction()

  async function refreshTodos(): Promise<Todo[]> {
    'use server'
    return getTodosAction()
  }

  return (
    <DashboardPage className="flex size-full flex-col">
      <DashboardPageHeader className="relative flex w-full items-center justify-end border-b border-border bg-card pb-[1rem]">
        <SidebarTriggerComponentMobile
          variant="ghost"
          size="icon"
          className="absolute left-6 top-1/2 -translate-y-1/2"
        />
        <div className="mr-2 flex items-center gap-3">
          <TodoCreateForm />
          <Separator orientation="vertical" className="h-4" />
          <ToggleTheme />
        </div>
      </DashboardPageHeader>
      <DashboardPageMain>
        <ContainerWrapper className="h-full min-h-0 flex-1">
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
