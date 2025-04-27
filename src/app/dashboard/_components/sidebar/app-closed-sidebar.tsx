import {
  House,
  LayoutDashboard,
  LogOut,
  Navigation,
  PanelLeftOpen,
  Rocket,
  Settings2,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Suspense } from 'react'
import { toast } from 'sonner'

import EditProfile from '@/app/dashboard/_components/profile/edit-profile'
import { ContainerWrapper } from '@/components/container'
import { SidebarNavLink } from '@/components/dashboard/sidebar'
import { Logo } from '@/components/logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSessionStore } from '@/store/user-store'

function UserDropdown() {
  const user = useSessionStore((state) => state.user)

  const handleSignOut = () => {
    try {
      signOut({ redirectTo: `/auth?mode=login&name=${user?.name}` })
      toast('Deslogado com sucesso!', {
        duration: 1000,
        position: 'top-center',
      })
    } catch (error) {
      toast.error('Erro ao deslogar!', {
        duration: 1000,
        position: 'top-center',
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="!b-0 relative ml-2 flex w-full items-center justify-between rounded-full !px-0 hover:bg-transparent"
        >
          <Avatar className="size-7 cursor-grab rounded-sm">
            <AvatarImage src={user?.image || ''} alt="user avatar" />
            <AvatarFallback className="rounded-none">
              {user?.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuGroup className="flex items-center justify-between p-2 font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
          <EditProfile user={user!} />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex cursor-pointer items-center justify-between">
            Configurações
            <Settings2 className="mr-2 size-4" />
          </DropdownMenuItem>
          <DropdownMenuItem className="flex cursor-pointer items-center justify-between">
            Upgrade
            <Rocket className="mr-2 size-4" />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex cursor-pointer items-center justify-between hover:hover:bg-destructive hover:hover:text-destructive-foreground"
        >
          Sair
          <LogOut className="mr-2 size-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UserDropdownClosedSidebarSkeleton() {
  return (
    <Button
      variant="ghost"
      className="relative ml-2 flex w-full cursor-default items-center justify-between rounded-full !px-0 hover:bg-transparent"
    >
      <Skeleton className="size-7 rounded-sm" />
    </Button>
  )
}

function AppClosedSidebar() {
  const { toggleSidebar } = useSidebar()

  const pathname = usePathname()

  const isActiveLink = (path: string) => {
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
      <SidebarHeader className="flex w-full items-center justify-center border-b border-border bg-muted py-4 dark:bg-background">
        <Logo />
      </SidebarHeader>
      <SidebarContent className="flex flex-grow flex-col bg-muted dark:bg-background">
        <nav className="flex flex-grow flex-col gap-2 !py-4">
          <SidebarNavLink
            href="/dashboard"
            active={isActiveLink('/dashboard')}
            className="justify-center"
          >
            <LayoutDashboard className="size-5" />
          </SidebarNavLink>
          <SidebarNavLink
            href="/dashboard/settings"
            active={isActiveLink('/dashboard/settings')}
            className="justify-center"
          >
            <Settings2 className="size-5" />
          </SidebarNavLink>
        </nav>
        <nav className="mt-auto flex w-full flex-col items-center justify-center space-y-3">
          <SidebarNavLink
            href="/"
            active={isActiveLink('/')}
            className="justify-center"
          >
            <House className="size-5" />
          </SidebarNavLink>
          <SidebarNavLink href="/auth" onClick={handleClickToNavigate}>
            <Navigation className="size-5" />
          </SidebarNavLink>
          <Tooltip disableHoverableContent>
            <ContainerWrapper className="flex w-full items-center justify-center border-t border-border py-2">
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="flex cursor-pointer items-center justify-center"
                  onClick={() => toggleSidebar()}
                >
                  <PanelLeftOpen className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end" className="text-sm">
                <span>Abrir</span>
              </TooltipContent>
            </ContainerWrapper>
          </Tooltip>
        </nav>
      </SidebarContent>
      <Separator className="w-full" />
      <SidebarFooter className="flex w-full items-center justify-center bg-muted p-2 dark:bg-background">
        <Suspense fallback={<UserDropdownClosedSidebarSkeleton />}>
          <UserDropdown />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  )
}

export { AppClosedSidebar }
