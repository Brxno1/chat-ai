'use client'

import { House, LayoutDashboard, Navigation, Settings2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { toast } from 'sonner'

import {
  SidebarHeaderTitle,
  SidebarNavLink,
} from '@/components/dashboard/sidebar'
import { Logo } from '@/components/logo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

import { SidebarTriggerComponent } from './sidebar-trigger'
import { UserDropdown, UserDropdownSkeleton } from './user-dropdown'

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
    <Sidebar>
      <SidebarHeader className="w-full rounded-sm border-b border-border bg-muted dark:bg-background">
        <SidebarHeaderTitle className="flex w-full items-center justify-between py-1">
          <Logo className="ml-2" />
          <SidebarTriggerComponent text="Fechar" />
        </SidebarHeaderTitle>
      </SidebarHeader>
      <SidebarContent className="flex flex-grow flex-col bg-muted !p-0 dark:bg-background">
        <SidebarGroup className="space-y-2">
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
        </SidebarGroup>

        <SidebarGroup className="mb-3 mt-auto">
          <SidebarMenuItem className="space-y-2">
            <SidebarNavLink href="/" active={isActive('/')}>
              <House className="mr-3 size-4" />
              Home
            </SidebarNavLink>
            <SidebarNavLink href="/auth" onClick={handleClickToNavigate}>
              <Navigation className="mr-3 size-4" />
              Site
            </SidebarNavLink>
          </SidebarMenuItem>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex w-full items-center justify-center rounded-sm border-t border-border bg-muted py-2 dark:bg-background">
        <Suspense fallback={<UserDropdownSkeleton />}>
          <UserDropdown />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  )
}
