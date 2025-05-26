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
import React from 'react'
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

function ClosedSidebarUserDropdown() {
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

  const onOpenChangeFn = (isOpen: boolean) => {
    if (isSigningOut && !isOpen) {
      return
    }
    setOpen(isOpen)
  }

  const handleSignOut = async (ev: React.MouseEvent) => {
    ev.preventDefault()

    await signOutFn()
  }

  return (
    <>
      {isSigningOut && (
        <div
          className="fixed inset-0 z-40 bg-muted/40 backdrop-blur-sm dark:bg-background/30 dark:backdrop-blur-md"
          aria-hidden="true"
        />
      )}
      <DropdownMenu open={open} onOpenChange={onOpenChangeFn}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="link"
            className="relative z-50 my-auto flex w-full items-center py-6"
          >
            <Avatar className="size-9 cursor-grab rounded-md">
              <AvatarImage src={user?.image || ''} alt="user avatar" />
              <AvatarFallback className="rounded-md">
                {user?.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-50 ml-2 w-56" align="end" forceMount>
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
    </>
  )
}

function UserDropdownClosedSidebarSkeleton() {
  return (
    <Button
      variant="ghost"
      className="relative flex items-center justify-center"
    >
      <Skeleton className="size-8 rounded-md" />
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
      <SidebarContent className="flex">
        <nav className="flex flex-grow flex-col gap-2 space-y-2">
          <SidebarLinks linksOptions={mainLinks} isActiveLink={isActiveLink} />
        </nav>
        <nav className="mt-auto flex flex-col items-center justify-center space-y-2">
          <SidebarLinks
            linksOptions={bottomLinks}
            isActiveLink={isActiveLink}
          />
          <ContainerWrapper className="flex w-full items-center justify-center px-2 pb-2">
            <SidebarTriggerComponent
              variant="outline"
              className="my-auto w-full"
            />
          </ContainerWrapper>
        </nav>
      </SidebarContent>
      <Separator className="w-full" />
      <SidebarFooter className="flex w-full items-center justify-center">
        <ClosedSidebarUserDropdown />
      </SidebarFooter>
    </Sidebar>
  )
}

export {
  ClosedSidebarUserDropdown,
  AppClosedSidebar,
  UserDropdownClosedSidebarSkeleton,
}
