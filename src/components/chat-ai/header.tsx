'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { User } from 'next-auth'
import React from 'react'

import { ComponentSwitchTheme } from '@/components/switch-theme'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ChatHeaderProps {
  user: User
}

function ChatHeader({ user }: ChatHeaderProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-8 cursor-grab rounded-sm">
          <AvatarImage src={user.image as string} alt="user avatar" />
          <AvatarFallback className="rounded-sm">
            {user.name?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link href="/dashboard">
          <DropdownMenuItem className="flex w-full items-center justify-center gap-2 text-xs">
            Acessar App
            <ArrowRight className="size-4" />
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center justify-center">
          <ComponentSwitchTheme />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ChatHeader }
