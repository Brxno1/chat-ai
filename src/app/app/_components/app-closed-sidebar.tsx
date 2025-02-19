import { House, ListTodo, PanelLeft, Settings2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Session } from 'next-auth'

import { Sidebar, SidebarNavLink } from '@/components/dashboard/sidebar'
import { Logo } from '@/components/logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
                  <p>Abrir barra lateral</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </nav>
      </main>
      <footer className="mt-auto flex w-full items-center justify-center border-t border-border py-4">
        <Avatar className="h-10 w-10 border border-purple-700">
          <AvatarImage src={user.image as string} />
          <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </footer>
    </Sidebar>
  )
}
