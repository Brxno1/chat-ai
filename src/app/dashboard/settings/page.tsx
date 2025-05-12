'use client'

import { ContainerWrapper } from '@/components/container'
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardPageMain,
} from '@/components/dashboard'
import { ToggleTheme } from '@/components/theme/toggle-theme'

export default function Settings() {
  return (
    <DashboardPage>
      <DashboardPageHeader>
        <ContainerWrapper className="mr-5">
          <ToggleTheme />
        </ContainerWrapper>
      </DashboardPageHeader>
      <DashboardPageMain className="flex h-full flex-col items-center">
        <h1 className="mt-10 text-2xl">Configurações</h1>
      </DashboardPageMain>
    </DashboardPage>
  )
}
