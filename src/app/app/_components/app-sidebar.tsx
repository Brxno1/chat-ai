'use client'

import { House, ListTodo, Settings2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Session } from 'next-auth'

import {
  SidebarHeaderTitle,
  SidebarNavHeader,
  SidebarNavHeaderTitle,
  SidebarNavLink,
  SidebarNavMain,
} from '@/components/dashboard/sidebar'
import { Logo } from '@/components/logo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
} from '@/components/ui/sidebar'

import { UserDropdown } from './user-dropdown'

type UserProps = {
  user: Session['user']
}

export function AppSidebar({ user }: UserProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }
  return (
    <Sidebar>
      <SidebarContent className="bg-background">
        <SidebarHeader className="h-13 flex border-b border-border py-3">
          <SidebarHeaderTitle className="mx-4">
            <Logo />
          </SidebarHeaderTitle>
        </SidebarHeader>
        <SidebarGroup className="flex flex-grow flex-col !p-0">
          <SidebarMenu className="p-2">
            <SidebarNavMain>
              <SidebarNavLink href="/app" active={isActive('/app')}>
                <ListTodo className="mr-3 h-4 w-4" />
                Tarefas
              </SidebarNavLink>
              <SidebarNavLink
                href="/app/settings"
                active={isActive('/app/settings')}
              >
                <Settings2 className="mr-3 h-4 w-4" />
                Configurações
              </SidebarNavLink>
            </SidebarNavMain>
          </SidebarMenu>

          <SidebarMenu className="mb-3 mt-auto p-2">
            <SidebarNavHeader>
              <SidebarNavHeaderTitle>Links extras</SidebarNavHeaderTitle>
            </SidebarNavHeader>
            <SidebarNavMain>
              <SidebarNavLink href="/" active={isActive('/')}>
                <House className="mr-3 h-4 w-4" />
                Home
              </SidebarNavLink>
              <SidebarNavLink href="/" active={isActive('/')}>
                Site
              </SidebarNavLink>
            </SidebarNavMain>
          </SidebarMenu>
          <SidebarFooter className="rounded-t-lg border-t border-border py-3">
            <UserDropdown user={user} />
          </SidebarFooter>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
