'use client'

import { useMutation } from '@tanstack/react-query'
import {
  ChevronUp,
  Loader2,
  LogOut,
  Rocket,
  Settings2,
  UserPlus,
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import React from 'react'
import { toast } from 'sonner'

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
import { useSessionUser } from '@/context/user'
import { useIsMobile } from '@/hooks/use-mobile'

import { EditProfile } from '../profile/edit-profile'
import { EditProfileMobile } from '../profile/edit-profile-mobile'
function UserDropdown() {
  const [open, setOpen] = React.useState(false)

  const { user } = useSessionUser()

  const isMobile = useIsMobile()

  const { mutateAsync: signOutFn, isPending: isSigningOut } = useMutation({
    mutationFn: async () => {
      await signOut({
        redirectTo: `/chat`,
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

  if (!user) {
    return <NotFoundUserDropdown />
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <div
        data-out={isSigningOut}
        className="fixed inset-0 z-50 backdrop-blur-sm data-[out=false]:hidden"
        aria-hidden="true"
      />
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="lg"
          data-dropdown={open ? 'open' : 'closed'}
          className="group relative z-50 mb-px flex w-full items-center justify-start space-x-2 rounded-xl border border-input px-2 py-6 group-data-[sidebar=closed]/sidebar:justify-center group-data-[sidebar=closed]/sidebar:p-6"
        >
          <Avatar className="size-9 cursor-grab rounded-md">
            <AvatarImage src={user.image || ''} alt="user avatar" />
            <AvatarFallback className="rounded-md font-semibold">
              {user.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="max-w-[8rem] truncate group-data-[sidebar=closed]/sidebar:hidden">
            {user.name}
          </p>
          <ChevronUp
            className="absolute right-4 transition-transform duration-300 group-data-[sidebar=closed]/sidebar:hidden group-data-[dropdown=open]:rotate-180"
            size={20}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="z-50 mb-5 w-56 bg-background"
        align="center"
      >
        <DropdownMenuGroup className="flex w-full items-center justify-between font-normal">
          <DropdownMenuItem className="flex flex-1 cursor-default flex-col items-start">
            <span className="max-w-[8.5rem] truncate text-sm font-medium leading-none">
              {user?.name}
            </span>
            <span className="max-w-[8.5rem] truncate text-xs leading-none text-muted-foreground">
              {user?.email}
            </span>
          </DropdownMenuItem>
          {isMobile ? <EditProfileMobile /> : <EditProfile />}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex items-center justify-between">
            Configurações
            <Settings2 className="mr-2 size-4" />
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center justify-between">
            Upgrade
            <Rocket className="mr-2 size-4" />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="flex items-center justify-between hover:hover:bg-destructive hover:hover:text-destructive-foreground"
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

function NotFoundUserDropdown() {
  return (
    <Link href="/auth" className="w-full">
      <Button
        variant="secondary"
        size="lg"
        className="mb-px flex w-full items-center justify-center rounded-lg p-4"
      >
        <UserPlus size={20} />
        <span className="group-data-[sidebar=closed]/sidebar:hidden">
          Entrar
        </span>
      </Button>
    </Link>
  )
}

export { UserDropdown, NotFoundUserDropdown }
