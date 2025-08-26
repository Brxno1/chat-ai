'use client'

import { randomBytes } from 'node:crypto'

import { useMutation } from '@tanstack/react-query'
import {
  ChevronUp,
  Eye,
  EyeClosed,
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
import { Separator } from '@/components/ui/separator'
import { useSessionUser } from '@/context/user'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/utils/utils'

import { EditProfile } from '../profile/edit-profile'
import { EditProfileMobile } from '../profile/edit-profile-mobile'

function UserDropdown() {
  const [open, setOpen] = React.useState(false)

  const { user } = useSessionUser()

  const isMobile = useIsMobile()

  const { mutateAsync: signOutFn, isPending: isSigningOut } = useMutation({
    mutationFn: async () => {
      await signOut({
        redirectTo: `/`,
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
          size="lg"
          data-dropdown={open ? 'open' : 'closed'}
          className="group relative z-50 mb-2 flex w-full items-center justify-start space-x-2 rounded-xl border border-input px-2 py-6 group-data-[sidebar=closed]/sidebar:justify-center group-data-[sidebar=closed]/sidebar:p-6"
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
        <DropdownMenuGroup className="flex w-full items-center justify-start gap-2">
          <UserInfo />
          <Separator orientation="vertical" className="h-6" />
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

function UserInfo() {
  const [showEmail, setShowEmail] = React.useState(true)

  const { user } = useSessionUser()

  return (
    <DropdownMenuItem className="flex flex-1 cursor-default flex-col items-start gap-0.5 hover:!bg-transparent">
      <span className="max-w-[8rem] truncate text-sm font-medium leading-none">
        {user?.name}
      </span>
      <div className="flex max-w-[8.5rem] items-center justify-center gap-2">
        <span
          className={cn(
            'w-[8rem] truncate text-xs text-muted-foreground',
            showEmail ? 'blur-sm' : 'blur-none',
          )}
        >
          {showEmail ? randomBytes(8).toString('hex') : user?.email}
        </span>
        <button
          className="my-auto rounded-md p-1.5 hover:bg-muted/50"
          aria-label="Toggle email visibility"
          onClick={(ev) => {
            ev.preventDefault()
            setShowEmail((prev) => !prev)
          }}
        >
          {showEmail ? (
            <Eye className="size-3.5" />
          ) : (
            <EyeClosed className="size-3.5" />
          )}
        </button>
      </div>
    </DropdownMenuItem>
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
