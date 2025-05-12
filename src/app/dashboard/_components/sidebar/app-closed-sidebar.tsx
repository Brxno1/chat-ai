'use client'

import { useMutation } from '@tanstack/react-query'
import {
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquare,
  Navigation,
  Rocket,
  Settings2,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import React, { Suspense } from 'react'
import { toast } from 'sonner'

import EditProfile from '@/app/dashboard/_components/profile/edit-profile'
import { ContainerWrapper } from '@/components/container'
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
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useSessionStore } from '@/store/user-store'

import { SidebarLinks } from './sidebar-links'
import { SidebarTriggerComponent } from './sidebar-trigger'

function UserDropdown() {
  const [open, setOpen] = React.useState(false)

  const { user } = useSessionStore()

  const { mutateAsync: signOutFn, isPending: isSigningOut } = useMutation({
    mutationFn: async () => {
      await signOut({
        redirectTo: `/auth?mode=login&name=${user!.name}`,
      })
    },
    onSuccess: () => {
      toast('Deslogado com sucesso!', {
        duration: 1000,
        position: 'top-center',
      })
    },
    onError: () => {
      toast.error('Erro ao deslogar!', {
        duration: 1000,
        position: 'top-center',
      })
    },
  })

  const handleSignOut = async (ev: React.MouseEvent) => {
    ev.preventDefault()

    await signOutFn()
  }

  const onOpenChangeFn = (isOpen: boolean) => {
    if (isSigningOut && !isOpen) {
      return
    }
    setOpen(isOpen)
  }

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChangeFn}>
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
          disabled={isSigningOut}
          className="flex cursor-pointer items-center justify-between hover:hover:bg-destructive hover:hover:text-destructive-foreground"
        >
          {isSigningOut ? (
            <>
              Saindo...
              <Loader2 className="mr-2 size-4 animate-spin" />
            </>
          ) : (
            <>
              Sair
              <LogOut className="mr-2 size-4" />
            </>
          )}
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
  const pathname = usePathname()

  const isActiveLink = (path: string) => {
    return pathname === path
  }

  const mainLinks = [
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

  const bottomLinks = [
    {
      href: '/',
      icon: MessageSquare,
      label: 'Chat',
    },
    {
      href: '/?navigation=true',
      icon: Navigation,
      label: 'Navegação',
    },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex w-full items-center justify-center border-b border-border bg-muted py-4 dark:bg-background">
        <Logo />
      </SidebarHeader>
      <SidebarContent className="flex bg-muted dark:bg-background">
        <nav className="flex flex-grow flex-col gap-2 !py-3">
          <SidebarLinks linksOptions={mainLinks} isActiveLink={isActiveLink} />
        </nav>
        <nav className="mt-auto flex flex-col items-center justify-center space-y-3">
          <SidebarLinks
            linksOptions={bottomLinks}
            isActiveLink={isActiveLink}
          />
          <ContainerWrapper className="flex w-full items-center justify-center border-t border-border p-2">
            <SidebarTriggerComponent text="Abrir" />
          </ContainerWrapper>
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
