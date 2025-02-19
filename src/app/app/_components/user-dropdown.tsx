import { LogOut, Rocket, Settings2 } from 'lucide-react'
import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'

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

type UserProps = {
  user: Session['user']
}

export function UserDropdown({ user }: UserProps) {
  const handleSignOut = () => {
    try {
      signOut({ redirectTo: '/login' })
      toast('Deslogado com sucesso!')
    } catch (error) {
      toast.error('Erro ao deslogar!')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="!b-0 relative ml-2 flex w-full items-center justify-between space-x-2 rounded-full !px-0 hover:bg-transparent"
        >
          <Avatar className="h-8 w-8 border border-purple-700">
            <AvatarImage src={user.image as string} alt="user avatar" />
            <AvatarFallback>
              {user.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-1 flex-col space-y-1 text-left">
            <p className="text-sm font-medium leading-none text-purple-500">
              {user.name}
            </p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="group">
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
