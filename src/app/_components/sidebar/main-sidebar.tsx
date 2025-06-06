'use client'

import { LayoutDashboard, MessageSquare, Settings } from 'lucide-react'
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
import { useChatStore } from '@/store/chat-store'
import { cn } from '@/utils/utils'

import { SidebarLinks } from './sidebar-links'
import { SidebarTriggerComponent } from './sidebar-trigger'
import { SidebarTriggerComponentMobile } from './sidebar-trigger-mobile'
import { UserDropdown } from './user-dropdown'

type ChatSidebarProps = {
  initialUser: User
  className?: string
}

export function MainSidebarContent({
  initialUser,
  className,
}: ChatSidebarProps) {
  const pathname = usePathname()
  const isActivePath = (path: string) => pathname === path

  const { open, isMobile } = useSidebar()
  const { resetChatState } = useChatStore()

  const handleResetChat = () => {
    resetChatState()
  }

  const mainLinks = [
    {
      href: '/chat',
      icon: MessageSquare,
      label: 'Chat',
      onClick: handleResetChat,
    },
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      href: '/dashboard/settings',
      icon: Settings,
      label: 'Configurações',
    },
  ]

  return (
    <Sidebar
      collapsible="icon"
      className={cn(className, 'group/sidebar')}
      side="left"
      data-sidebar={open ? 'open' : 'closed'}
    >
      <SidebarHeader className="w-full bg-card px-0">
        <SidebarHeaderTitle className="flex w-full items-center justify-between p-1.5 group-data-[sidebar=closed]/sidebar:py-2.5">
          <Logo className="mx-auto group-data-[sidebar=open]/sidebar:ml-2" />
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
        <Separator />
      </SidebarHeader>
      <SidebarContent className="flex h-[calc(100vh-130px)] flex-col overflow-hidden bg-card">
        <SidebarGroup className="space-y-2">
          <SidebarLinks
            links={mainLinks}
            isActiveLink={isActivePath}
            open={open || isMobile}
          />
        </SidebarGroup>
        <Separator className="group-data-[sidebar=closed]/sidebar:hidden" />
        <SidebarGroup className="mt-auto space-y-2">
          {!isMobile && (
            <SidebarTriggerComponent
              variant="ghost"
              className="!border-none group-data-[sidebar=open]/sidebar:hidden"
            />
          )}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex w-full items-center justify-center bg-card">
        <UserDropdown user={initialUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
