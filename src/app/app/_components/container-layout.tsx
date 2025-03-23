'use client'

import { useSession } from 'next-auth/react'
import { PropsWithChildren } from 'react'

import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

import { AppClosedSidebar } from './app-closed-sidebar'
import { AppSidebar } from './app-sidebar'

export function ContainerLayout({ children }: PropsWithChildren) {
  const { data: session } = useSession()
  const { open, isMobile } = useSidebar()

  return (
    <div
      className={cn({
        'grid h-screen grid-cols-[16rem_1fr]': open && !isMobile,
        'grid h-screen grid-cols-[4rem_1fr] items-center justify-center':
          !open && !isMobile,
      })}
    >
      {session && !!open && <AppSidebar user={session.user} />}
      {session && !open && <AppClosedSidebar user={session.user} />}
      <main className="flex flex-col">{children}</main>
    </div>
  )
}
