'use client'

import { LayoutDashboard, MessageSquare, Settings2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { User } from 'next-auth'

import { SidebarHeaderTitle } from '@/components/dashboard/sidebar'
import { Logo } from '@/components/logo'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/utils/utils'

import { SidebarLinks } from './sidebar-links'
import { SidebarTriggerComponent } from './sidebar-trigger'
import { UserDropdown } from './user-dropdown'

type AppSidebarProps = {
  initialUser: User
  side?: 'left' | 'right'
  className?: string
}

export function AppSidebar({
  initialUser,
  side = 'left',
  className,
}: AppSidebarProps) {
  const { isMobile, open } = useSidebar()

  const pathname = usePathname()
  const isActivePath = (path: string) => pathname === path

  const mainLinks = [
    {
      href: '/chat',
      icon: MessageSquare,
      label: 'Chat',
    },
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      href: '/dashboard/settings',
      icon: Settings2,
      label: 'Configurações',
    },
  ]

  if (isMobile) {
    return null
  }

  return (
    <Sidebar
      collapsible="icon"
      className={cn(className, 'group/sidebar fixed inset-0 border')}
      side={side}
      data-sidebar={open ? 'open' : 'closed'}
    >
      <SidebarHeader className="w-full bg-card px-0">
        <SidebarHeaderTitle className="flex w-full items-center justify-between p-1.5 group-data-[sidebar=closed]/sidebar:py-2.5">
          <Logo className="mx-auto group-data-[sidebar=open]/sidebar:ml-2" />
          <SidebarTriggerComponent
            variant="ghost"
            className="!border-none text-muted-foreground group-data-[sidebar=closed]/sidebar:hidden"
          />
        </SidebarHeaderTitle>
        <Separator />
      </SidebarHeader>
      <SidebarContent className="flex h-[calc(100vh-130px)] flex-col overflow-hidden bg-card">
        <SidebarGroup className="space-y-2">
          <SidebarLinks
            links={mainLinks}
            isActiveLink={isActivePath}
            open={open}
          />
        </SidebarGroup>
        <Separator className="group-data-[sidebar=closed]/sidebar:hidden" />
        <SidebarGroup className="mt-auto space-y-2">
          <SidebarTriggerComponent
            variant="ghost"
            className="!border-none text-muted-foreground group-data-[sidebar=open]/sidebar:hidden"
          />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex w-full items-center justify-center bg-card">
        <UserDropdown user={initialUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
