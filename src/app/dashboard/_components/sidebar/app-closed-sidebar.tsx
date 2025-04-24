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
import { toast } from 'sonner'

import EditProfile from '@/app/dashboard/_components/profile/edit-profile'
import { ContainerWrapper } from '@/components/container'
import { Sidebar, SidebarNavLink } from '@/components/dashboard/sidebar'
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
import { useSidebar } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSessionStore } from '@/store/user-store'

export function UserDropdown() {
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

  if (!user) {
    return (
      <ContainerWrapper className="flex w-full items-center justify-center px-2">
        <Skeleton className="h-8 w-8 rounded-sm" />
      </ContainerWrapper>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="!b-0 relative ml-4 flex w-full items-center justify-between space-x-2 rounded-full !px-0 hover:bg-transparent"
        >
          <Avatar className="h-8 w-8 cursor-grab rounded-sm">
            <AvatarImage src={user.image || ''} alt="user avatar" />
            <AvatarFallback className="rounded-none">
              {user.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuGroup className="flex items-center justify-between p-2 font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
          <EditProfile user={user} />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            Configurações
            <Settings2 className="ml-auto h-4 w-4" />
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            Upgrade
            <Rocket className="ml-auto h-4 w-4" />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer hover:hover:bg-destructive hover:hover:text-destructive-foreground"
        >
          Sair
          <LogOut className="ml-auto h-4 w-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppClosedSidebar() {
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
    <Sidebar className="flex flex-col items-center justify-center border-r border-border">
      <header className="mb-auto flex w-full items-center justify-center border-b border-border py-3">
        <Logo />
      </header>
      <main className="flex h-full flex-grow flex-col">
        <nav className="flex flex-grow flex-col gap-2 !p-0">
          <SidebarNavLink href="/dashboard" active={isActiveLink('/dashboard')}>
            <LayoutDashboard className="h-6 w-6" />
          </SidebarNavLink>
          <SidebarNavLink
            href="/dashboard/settings"
            active={isActiveLink('/dashboard/settings')}
          >
            <Settings2 className="h-6 w-6" />
          </SidebarNavLink>
        </nav>
        <nav className="mt-auto flex flex-col items-center justify-center space-y-3">
          <SidebarNavLink href="/" active={isActiveLink('/')}>
            <House className="h-6 w-6" />
          </SidebarNavLink>
          <SidebarNavLink href="/auth" onClick={handleClickToNavigate}>
            <Navigation className="h-6 w-6" />
          </SidebarNavLink>
          <Tooltip>
            <ContainerWrapper className="flex w-full items-center justify-center border-t border-border">
              <TooltipTrigger asChild>
                <button
                  className="mt-4 flex cursor-pointer items-center justify-center"
                  onClick={() => toggleSidebar()}
                >
                  <PanelLeftOpen className="h-6 w-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent align="end" className="text-sm">
                <span>Abrir</span>
              </TooltipContent>
            </ContainerWrapper>
          </Tooltip>
        </nav>
      </main>
      <footer className="flex w-full items-center justify-center border-t border-border py-4">
        <UserDropdown />
      </footer>
    </Sidebar>
  )
}
