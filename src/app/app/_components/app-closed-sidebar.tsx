import {
  House,
  ListTodo,
  LogOut,
  PanelLeft,
  Rocket,
  Settings2,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'

import { Sidebar, SidebarNavLink } from '@/components/dashboard/sidebar'
import { Logo } from '@/components/logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSidebar } from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type UserProps = {
  user: Session['user']
}

export function UserDropdown({ user }: UserProps) {
  console.log(user)

  const handleSignOut = () => {
    try {
      signOut({ redirectTo: '/auth' })
      toast.success('Deslogado com sucesso!', {
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
          className="!b-0 relative ml-4 flex w-full items-center justify-between space-x-2 rounded-full !px-0 hover:bg-transparent"
        >
          <Avatar className="h-8 w-8 cursor-grab rounded-none">
            <AvatarImage src={user.image as string} alt="user avatar" />
            <AvatarFallback className="rounded-none">
              {user.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Configurações
            <Settings2 className="ml-auto h-4 w-4" />
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer hover:bg-gradient-to-r hover:from-purple-500 hover:to-teal-400 hover:shadow-sm hover:shadow-purple-500">
            Upgrade
            <Rocket className="ml-auto h-4 w-4" />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer hover:hover:bg-destructive/90 hover:hover:text-destructive-foreground"
        >
          Sair
          <LogOut className="ml-auto h-4 w-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppClosedSidebar({ user }: UserProps) {
  const pathname = usePathname()
  const { state, toggleSidebar } = useSidebar()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <Sidebar className="flex flex-col items-center justify-center border-r border-border">
      <header className="mb-auto flex w-full items-center justify-center border-b border-border py-3">
        <Logo />
      </header>
      <main className="flex h-full flex-grow flex-col">
        <nav className="flex flex-grow flex-col gap-2 !p-0">
          <SidebarNavLink href="/app" active={isActive('/app')}>
            <ListTodo className="h-6 w-6" />
          </SidebarNavLink>
          <SidebarNavLink
            href="/app/settings"
            active={isActive('/app/settings')}
          >
            <Settings2 className="h-6 w-6" />
          </SidebarNavLink>
        </nav>
        <nav className="mt-auto flex flex-col items-center justify-center space-y-3">
          <SidebarNavLink href="/" active={isActive('/')}>
            <House className="h-6 w-6" />
          </SidebarNavLink>
          {state === 'collapsed' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="flex cursor-pointer items-center justify-center"
                    onClick={() => toggleSidebar()}
                  >
                    <PanelLeft className="h-6 w-6" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  align="end"
                  className="bg-background text-sm text-foreground"
                >
                  <p>Abrir</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </nav>
      </main>
      <footer className="mt-auto flex w-full items-center justify-center border-t border-border py-4">
        <UserDropdown user={user} />
      </footer>
    </Sidebar>
  )
}
