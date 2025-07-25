'use client'

import { LayoutDashboard, MessageSquare } from 'lucide-react'
import { usePathname } from 'next/navigation'

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
import { useChatStore } from '@/store/chat'
import { cn } from '@/utils/utils'

import { SidebarLinks } from './sidebar-links'
import { SidebarTriggerComponent } from './sidebar-trigger'
import { SidebarTriggerComponentMobile } from './sidebar-trigger-mobile'
import { UserDropdown } from './user-dropdown'

type ChatSidebarProps = {
  className?: string
}

export function DashboardSidebarContent({ className }: ChatSidebarProps) {
  const pathname = usePathname()
  const isActivePath = (path: string) => pathname === path

  const { open, isMobile } = useSidebar()
  const { resetChatState } = useChatStore()

  const handleResetChat = () => {
    resetChatState()
  }

  const mainLinks = [
    {
      href: '/',
      icon: MessageSquare,
      label: 'Chat',
      onClick: handleResetChat,
    },
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
  ]

  return (
    <Sidebar
      collapsible="icon"
      className={cn(className, 'group/sidebar')}
      side="left"
      data-sidebar={open ? 'open' : 'closed'}
    >
      <SidebarHeader className="w-full !border-r-0 bg-card">
        <SidebarHeaderTitle className="flex w-full items-center justify-between p-1.5 group-data-[sidebar=closed]/sidebar:py-2.5">
          <Logo className="group-data-[sidebar=closed]/sidebar:mx-auto group-data-[sidebar=open]/sidebar:ml-4" />
          {isMobile ? (
            <SidebarTriggerComponentMobile
              variant="ghost"
              size="icon"
              className=""
            />
          ) : (
            <SidebarTriggerComponent
              className="!border-none group-data-[sidebar=closed]/sidebar:hidden"
              variant="ghost"
            />
          )}
        </SidebarHeaderTitle>
      </SidebarHeader>
      <Separator />
      <SidebarContent className="flex flex-col overflow-hidden bg-card">
        <SidebarGroup className="space-y-2">
          {mainLinks.map((link) => (
            <SidebarLinks
              key={link.href}
              link={link}
              isActiveLink={isActivePath}
              open={open || isMobile}
            />
          ))}
        </SidebarGroup>
        {!isMobile && (
          <SidebarGroup className="mt-auto data-[mobile=true]:flex group-data-[sidebar=open]/sidebar:hidden">
            <SidebarTriggerComponent
              variant="ghost"
              className="!border-none group-data-[sidebar=open]/sidebar:hidden"
            />
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="flex w-full items-center justify-center bg-card">
        <UserDropdown />
      </SidebarFooter>
    </Sidebar>
  )
}
