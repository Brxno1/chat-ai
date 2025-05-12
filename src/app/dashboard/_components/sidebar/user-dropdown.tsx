'use client'

import { useMutation } from '@tanstack/react-query'
import { ChevronUp, Loader2, LogOut, Rocket, Settings2 } from 'lucide-react'
import { signOut } from 'next-auth/react'
import React from 'react'
import { toast } from 'sonner'

import EditProfile from '@/app/dashboard/_components/profile/edit-profile'
import { ContainerWrapper } from '@/components/container'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useSessionStore } from '@/store/user-store'
import { cn } from '@/utils/utils'

function UserDropdown() {
  const { user } = useSessionStore()

  const [open, setOpen] = React.useState(false)

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
          variant="outline"
          size="lg"
          className={cn('relative flex w-full items-center justify-start p-2')}
        >
          <ContainerWrapper className="flex items-center gap-3">
            <Avatar className="size-8 cursor-grab rounded-sm">
              <AvatarImage src={user?.image || ''} alt="user avatar" />
              <AvatarFallback className="rounded-sm font-semibold">
                {user?.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="font-semibold leading-none">{user?.name}</p>
          </ContainerWrapper>
          <ChevronUp
            className={cn('absolute right-2 size-4', {
              'rotate-180 animate-in fade-in-0': open,
            })}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align={'center'} forceMount>
        <DropdownMenuGroup className="flex items-center justify-between p-2 font-normal">
          <ContainerWrapper className="flex flex-col space-y-2">
            <span className="text-sm font-medium leading-none">
              {user?.name}
            </span>
            <span className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </span>
          </ContainerWrapper>
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

//  hover:bg-gradient-to-r hover:hover:from-purple-600 hover:hover:to-teal-400 hover:hover:shadow-sm hover:hover:shadow-purple-500

function UserDropdownSkeleton() {
  return (
    <div
      className={cn(
        'relative flex w-full cursor-default items-center justify-start gap-2 rounded-md px-2 py-2',
      )}
    >
      <Skeleton className="size-9 rounded-sm" />
      <Skeleton className="h-4 w-24 rounded-sm" />
      <Skeleton className="absolute right-2 size-4 rounded-sm" />
    </div>
  )
}

export { UserDropdown, UserDropdownSkeleton }
