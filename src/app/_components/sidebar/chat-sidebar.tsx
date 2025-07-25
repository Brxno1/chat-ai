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
import { useSessionUser } from '@/context/user'
import { useChatStore } from '@/store/chat'
import { cn } from '@/utils/utils'

import { Historical } from '../../chat/_components/historical'
import { SidebarLinks } from './sidebar-links'
import { SidebarTriggerComponent } from './sidebar-trigger'
import { SidebarTriggerComponentMobile } from './sidebar-trigger-mobile'
import { UserDropdown } from './user-dropdown'

type ChatSidebarProps = {
  className?: string
}

export function ChatSidebar({ className }: ChatSidebarProps) {
  const pathname = usePathname()
  const isActivePath = (path: string) => pathname.startsWith(path)

  const { open, isMobile } = useSidebar()
  const { resetChatState } = useChatStore()
  const { user } = useSessionUser()

  const handleClick = () => {
    resetChatState()
  }

  const mainLinks = [
    {
      href: '/',
      icon: MessageSquare,
      label: 'Chat',
      onClick: handleClick,
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
      <SidebarHeader className="w-full !border-r-0 bg-card group-data-[sidebar=closed]/sidebar:py-3">
        <SidebarHeaderTitle className="flex w-full items-center justify-between p-1.5">
          <Logo className="group-data-[sidebar=closed]/sidebar:mx-auto" />
          {isMobile ? (
            <SidebarTriggerComponentMobile variant="ghost" size="icon" />
          ) : (
            <SidebarTriggerComponent
              className="!border-none group-data-[sidebar=closed]/sidebar:hidden"
              variant="ghost"
            />
          )}
        </SidebarHeaderTitle>
      </SidebarHeader>
      <Separator />
      <SidebarContent className="flex h-screen flex-col overflow-hidden bg-card">
        <SidebarGroup className="space-y-2">
          {mainLinks.map((link) => (
            <SidebarLinks
              key={link.href}
              link={link}
              isActiveLink={isActivePath}
              open={open}
            />
          ))}
        </SidebarGroup>
        {user && (
          <>
            <Separator className="group-data-[sidebar=closed]/sidebar:hidden" />
            <SidebarGroup className="flex max-h-full flex-1 flex-col overflow-hidden">
              <Historical />
            </SidebarGroup>
          </>
        )}
        {!isMobile && (
          <SidebarGroup
            data-mobile={isMobile}
            className="mt-auto group-data-[sidebar=open]/sidebar:hidden"
          >
            <SidebarTriggerComponent variant="ghost" className="!border-none" />
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="flex w-full items-center justify-center bg-card">
        <UserDropdown />
      </SidebarFooter>
    </Sidebar>
  )
}
