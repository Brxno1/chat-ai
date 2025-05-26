'use client'

import { useMutation } from '@tanstack/react-query'
import {
  ChevronsUpDown,
  Loader2,
  LogOut,
  Rocket,
  Settings2,
} from 'lucide-react'
import { User } from 'next-auth'
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
import { truncateText } from '@/utils/truncate-text'

function UserDropdown({ user }: { user: User }) {
  const [open, setOpen] = React.useState(false)

  const { mutateAsync: signOutFn, isPending: isSigningOut } = useMutation({
    mutationFn: async () => {
      await signOut({
        redirectTo: `/auth?mode=login&name=${user.name}`,
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

  return (
    <>
      {isSigningOut && (
        <div
          className="fixed inset-0 z-40 bg-muted/40 backdrop-blur-sm dark:bg-background/30 dark:backdrop-blur-md"
          aria-hidden="true"
        />
      )}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="relative z-50 flex w-full items-center justify-start rounded-xl px-2 py-6"
          >
            <ContainerWrapper className="flex items-center gap-3">
              <Avatar className="size-9 cursor-grab rounded-md">
                <AvatarImage src={user.image || ''} alt="user avatar" />
                <AvatarFallback className="rounded-md font-semibold">
                  {user.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p>{truncateText(user.name || '', 20)}</p>
            </ContainerWrapper>
            <ChevronsUpDown className="absolute right-2 size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="z-50 mb-5 w-56"
          align="center"
          forceMount
        >
          <DropdownMenuGroup className="flex items-center justify-between p-2 font-normal">
            <ContainerWrapper className="flex flex-col space-y-2">
              <span className="text-sm font-medium leading-none">
                {truncateText(user?.name || '', 20)}
              </span>
              <span className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </span>
            </ContainerWrapper>
            <EditProfile user={user} />
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

function UserDropdownSkeleton() {
  return (
    <Button
      variant="outline"
      disabled
      className="relative flex w-full items-center justify-start rounded-xl px-2 py-6"
    >
      <Skeleton className="size-9 rounded-md" />
      <Skeleton className="h-3 w-24 rounded-sm" />
      <ChevronsUpDown className="absolute right-2 size-4 rounded-sm" />
    </Button>
  )
}

export { UserDropdown, UserDropdownSkeleton }
