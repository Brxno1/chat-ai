import Container from '@/components/container'
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardPageMain,
} from '@/components/dashboard/page'
import { ToggleTheme } from '@/components/toggle-theme'
import { SidebarTrigger } from '@/components/ui/sidebar'

export default async function Settings() {
  return (
    <DashboardPage>
      <DashboardPageHeader>
        <SidebarTrigger />
        <Container className="mr-5">
          <ToggleTheme />
        </Container>
      </DashboardPageHeader>
      <DashboardPageMain className="flex h-full flex-col items-center">
        <h1 className="mt-10 text-2xl">Configurações</h1>
      </DashboardPageMain>
    </DashboardPage>
  )
}
