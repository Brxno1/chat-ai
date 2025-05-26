'use client'

import { LayoutDashboard, MessageSquare, Settings2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { User } from 'next-auth'

import {
  SidebarHeaderTitle,
  SidebarNavLink,
} from '@/components/dashboard/sidebar'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/utils/utils'

import { ClosedSidebarUserDropdown } from './app-closed-sidebar'
import { SidebarTriggerComponent } from './sidebar-trigger'
import { UserDropdown } from './user-dropdown'

type AppSidebarProps = {
  initialUser?: User
}

export function AppSidebar({ initialUser }: AppSidebarProps) {
  const pathname = usePathname()
  const { open, isMobile } = useSidebar()
  const isActivePath = (path: string) => pathname === path

  const mainLinks = [
    {
      href: '/',
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
    <Sidebar collapsible="icon" className="!p-0">
      <SidebarHeader className="w-full">
        <SidebarHeaderTitle className="flex w-full items-center justify-between py-1.5">
          <Logo className={cn('mx-auto', { 'ml-2': open })} />
          {open && (
            <SidebarTriggerComponent
              variant="outline"
              size="sm"
              className="!border-none text-muted-foreground"
            />
          )}
        </SidebarHeaderTitle>
        <Separator />
      </SidebarHeader>
      <SidebarContent className="flex flex-grow flex-col">
        <SidebarGroup className="space-y-2">
          {mainLinks.map((link) => (
            <Tooltip key={link.href} disableHoverableContent>
              <TooltipTrigger asChild>
                <div>
                  <SidebarNavLink
                    href={link.href}
                    active={isActivePath(link.href)}
                    className={cn(open ? 'gap-2 pl-3' : 'flex justify-center')}
                  >
                    <link.icon size={20} />
                    {open && link.label}
                  </SidebarNavLink>
                </div>
              </TooltipTrigger>
              {!open && (
                <TooltipContent side="right">{link.label}</TooltipContent>
              )}
            </Tooltip>
          ))}
        </SidebarGroup>
        <SidebarGroup className="mt-auto space-y-2">
          {!open && (
            <SidebarTriggerComponent
              variant="outline"
              size="sm"
              className="!border-none text-muted-foreground"
            />
          )}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex w-full items-center justify-center">
        {open ? (
          <UserDropdown user={initialUser!} />
        ) : (
          <ClosedSidebarUserDropdown />
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
