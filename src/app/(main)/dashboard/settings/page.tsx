'use client'

import { ContainerWrapper } from '@/components/container'
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardPageMain,
} from '@/components/dashboard'
import { ToggleTheme } from '@/components/theme/toggle-theme'

import { SidebarTriggerComponent } from '../../_components/sidebar/sidebar-trigger'

export default function Settings() {
  return (
    <DashboardPage>
      <DashboardPageHeader>
        <SidebarTriggerComponent variant="outline" size="sm" />
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
