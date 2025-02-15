'use client'

import { useSession } from 'next-auth/react'
import { PropsWithChildren } from 'react'

import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

import { AppSidebar } from './main-sidebar'

export function ContainerLayout({ children }: PropsWithChildren) {
  const { data: session } = useSession()
  const { open, isMobile } = useSidebar()

  return (
    <div
      className={cn('', {
        'grid h-screen grid-cols-[16rem_1fr]': open,
        'grid h-screen grid-cols-[0_80%] items-center justify-center':
          !open && !isMobile,
      })}
    >
      {session && <AppSidebar user={session.user} />}
      <main className="flex flex-col">{children}</main>
    </div>
  )
}
