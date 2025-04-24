'use client'

import { House, LayoutDashboard, Navigation, Settings2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'

import {
  SidebarHeaderTitle,
  SidebarNavHeader,
  SidebarNavHeaderTitle,
  SidebarNavLink,
  SidebarNavMain,
} from '@/components/dashboard/sidebar'
import { Logo } from '@/components/logo'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@/components/ui/sidebar'

import { SidebarTriggerComponent } from './sidebar-trigger'
import { UserDropdown } from './user-dropdown'

export function AppSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleClickToNavigate = () => {
    toast.warning('Em desenvolvimento!', {
      duration: 1000,
      position: 'top-center',
    })
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-background">
        <SidebarHeader className="flex w-full border-b border-border py-3">
          <SidebarHeaderTitle className="flex items-center justify-between">
            <Logo className="ml-2" />
            <SidebarTriggerComponent />
          </SidebarHeaderTitle>
        </SidebarHeader>
        <SidebarGroup className="flex flex-grow flex-col !p-0">
          <SidebarGroup className="p-2">
            <SidebarNavMain>
              <SidebarNavLink href="/dashboard" active={isActive('/dashboard')}>
                <LayoutDashboard className="mr-3 size-4" />
                Dashboard
              </SidebarNavLink>
              <SidebarNavLink
                href="/dashboard/settings"
                active={isActive('/dashboard/settings')}
              >
                <Settings2 className="mr-3 size-4" />
                Configurações
              </SidebarNavLink>
            </SidebarNavMain>
          </SidebarGroup>

          <SidebarGroup className="mb-3 mt-auto p-2">
            <SidebarNavHeader>
              <SidebarNavHeaderTitle>Links extras</SidebarNavHeaderTitle>
            </SidebarNavHeader>
            <SidebarNavMain>
              <SidebarNavLink href="/" active={isActive('/')}>
                <House className="mr-3 size-4" />
                Home
              </SidebarNavLink>
              <SidebarNavLink href="/auth" onClick={handleClickToNavigate}>
                <Navigation className="mr-3 size-4" />
                Site
              </SidebarNavLink>
            </SidebarNavMain>
          </SidebarGroup>
          <Separator className="w-full" />
          <SidebarFooter className="py-4">
            <UserDropdown />
          </SidebarFooter>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
