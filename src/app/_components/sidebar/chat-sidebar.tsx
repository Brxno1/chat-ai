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
import { useUser } from '@/context/user-provider'
import { useChatStore } from '@/store/chat-store'
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
  const { user } = useUser()

  const handleClick = () => {
    resetChatState()
  }

  const mainLinks = [
    {
      href: '/chat',
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
      <SidebarHeader className="w-full border-red-500 bg-card px-0">
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
