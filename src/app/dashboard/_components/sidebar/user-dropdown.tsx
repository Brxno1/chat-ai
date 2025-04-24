import { ChevronUp, LogOut, Rocket, Settings2 } from 'lucide-react'
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

export function UserDropdown() {
  const user = useSessionStore((state) => state.user)

  const [open, setOpen] = React.useState(false)

  const handleSignOut = () => {
    try {
      signOut({ redirectTo: `/auth?mode=login&name=${user!.name}` })
      toast('Deslogado com sucesso!', {
        duration: 1000,
        position: 'bottom-left',
      })
    } catch (error) {
      toast.error('Erro ao deslogar!', {
        duration: 1000,
        position: 'bottom-left',
      })
    }
  }

  if (!user) {
    return (
      <Button
        variant="outline"
        size="lg"
        className={cn(
          'relative flex w-full items-center justify-start px-2 py-5',
        )}
      >
        <Skeleton className="h-8 w-8 rounded-sm" />
        <Skeleton className="h-5 w-28 rounded-sm" />
        <Skeleton className="absolute right-2 size-4 rounded-sm" />
      </Button>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className={cn(
            'relative flex w-full items-center justify-start px-2 py-5',
          )}
        >
          <ContainerWrapper className="flex items-center gap-3">
            <Avatar className="h-8 w-8 cursor-grab rounded-sm">
              <AvatarImage src={user.image as string} alt="user avatar" />
              <AvatarFallback className="rounded-sm font-semibold">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="font-medium leading-none text-purple-500">
              {user.name}
            </p>
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
              {user.name}
            </span>
            <span className="text-xs leading-none text-muted-foreground">
              {user.email}
            </span>
          </ContainerWrapper>
          <EditProfile user={user} />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex cursor-pointer items-center justify-between">
            Configurações
            <Settings2 className="mr-4 size-4" />
          </DropdownMenuItem>
          <DropdownMenuItem className="flex cursor-pointer items-center justify-between">
            Upgrade
            <Rocket className="mr-4 size-4" />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex cursor-pointer items-center justify-between hover:hover:bg-destructive hover:hover:text-destructive-foreground"
        >
          Sair
          <LogOut className="mr-4 size-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

//  hover:bg-gradient-to-r hover:hover:from-purple-600 hover:hover:to-teal-400 hover:hover:shadow-sm hover:hover:shadow-purple-500
