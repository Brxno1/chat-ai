'use client'

import {
  ChevronRight,
  History,
  LayoutDashboard,
  MessageSquare,
  Settings2,
  Trash2,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { User } from 'next-auth'
import React from 'react'

import { SidebarHeaderTitle } from '@/components/dashboard/sidebar'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
import { truncateText } from '@/utils/truncate-text'
import { cn } from '@/utils/utils'

import { SidebarLinks } from './sidebar-links'
import { SidebarTriggerComponent } from './sidebar-trigger'
import { UserDropdown } from './user-dropdown'

type AppSidebarProps = {
  initialUser: User
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'floating' | 'inset'
  className?: string
  offsetLeft?: number
}

export function AppSidebar({
  initialUser,
  side = 'left',
  variant = 'sidebar',
  className,
  offsetLeft = 0,
}: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const { isMobile, open } = useSidebar()

  const pathname = usePathname()
  const isActivePath = (path: string) => pathname === path

  const historical = [
    {
      title: 'Como implementar autenticação OAuth2 em Next.js?',
      createdAt: new Date('2024-01-15T09:23:45Z'),
    },
    {
      title: 'Explicação sobre React Server Components',
      createdAt: new Date('2024-01-12T14:30:22Z'),
    },
    {
      title: 'Melhores práticas para API REST em Node.js',
      createdAt: new Date('2024-01-08T11:15:08Z'),
    },
    {
      title: 'Como resolver problemas de performance em aplicações React',
      createdAt: new Date('2023-12-28T16:42:37Z'),
    },
    {
      title: 'Implementação de sistema de pagamentos com Stripe',
      createdAt: new Date('2023-12-22T10:05:19Z'),
    },
    {
      title: 'Arquitetura de microserviços com Docker e Kubernetes',
      createdAt: new Date('2023-12-15T08:30:45Z'),
    },
    {
      title: 'Como criar um design system escalável',
      createdAt: new Date('2023-12-10T13:27:31Z'),
    },
    {
      title: 'Integrando IA generativa em aplicações web',
      createdAt: new Date('2023-12-05T15:18:02Z'),
    },
    {
      title: 'Implementação de WebSockets para chat em tempo real',
      createdAt: new Date('2023-11-29T09:45:11Z'),
    },
    {
      title: 'Estratégias de SEO para aplicações SPA',
      createdAt: new Date('2023-11-22T11:33:27Z'),
    },
    {
      title: 'Como construir uma API GraphQL com TypeScript',
      createdAt: new Date('2023-11-18T14:20:38Z'),
    },
    {
      title: 'Testes automatizados com Jest e Testing Library',
      createdAt: new Date('2023-11-10T16:55:42Z'),
    },
    {
      title: 'Implementação de PWA com Next.js',
      createdAt: new Date('2023-11-05T08:12:19Z'),
    },
    {
      title: 'Como criar animações eficientes com Framer Motion',
      createdAt: new Date('2023-10-30T10:28:36Z'),
    },
    {
      title: 'Arquitetura de software para projetos de larga escala',
      createdAt: new Date('2023-10-25T13:41:05Z'),
    },
  ]

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
      className={cn(className, 'group/sidebar border')}
      side={side}
      data-sidebar={open ? 'open' : 'closed'}
      variant={variant}
      offsetLeft={offsetLeft}
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
        <SidebarGroup className="flex flex-1 flex-col overflow-hidden">
          <Collapsible
            open={isCollapsed}
            onOpenChange={setIsCollapsed}
            className="group/collapsible flex h-full flex-col"
            data-collapsed={isCollapsed ? 'open' : 'closed'}
            data-pathname={
              pathname === '/dashboard' || pathname === '/dashboard/settings'
            }
          >
            <CollapsibleTrigger asChild disabled={historical.length === 0}>
              <Button
                variant="outline"
                className="w-full justify-start rounded-md text-sm group-data-[pathname=true]/collapsible:hidden group-data-[sidebar=closed]/sidebar:hidden"
              >
                <History size={20} />
                <span className="flex items-center gap-2">
                  Histórico
                  <ChevronRight className="absolute right-4 transition-all duration-300 animate-in group-data-[collapsed=open]/collapsible:rotate-90" />
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 overflow-y-auto rounded-md bg-background pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-full hover:scrollbar-thumb-gray-300/80 group-data-[collapsed=closed]/collapsible:hidden group-data-[pathname=true]/collapsible:hidden group-data-[sidebar=closed]/sidebar:hidden group-data-[collapsed=open]/collapsible:border">
              {historical.map((item, index) => (
                <div
                  key={index}
                  role="button"
                  className="relative flex w-full cursor-pointer items-start justify-between rounded-md px-2 py-1 text-left hover:bg-accent"
                >
                  <Tooltip>
                    <div className="flex flex-col items-start gap-1">
                      <TooltipTrigger asChild>
                        <span className="text-xs">
                          {truncateText(item.title, 30)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="bg-secondary text-secondary-foreground"
                      >
                        {item.title}
                      </TooltipContent>
                      <span className="text-2xs text-muted-foreground">
                        {item.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </Tooltip>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                  >
                    <Trash2 size={20} />
                  </Button>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
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
