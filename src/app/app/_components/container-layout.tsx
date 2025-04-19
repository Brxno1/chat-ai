'use client'

import { PropsWithChildren } from 'react'

import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/utils/utils'

import { AppClosedSidebar } from './sidebar/app-closed-sidebar'
import { AppSidebar } from './sidebar/app-sidebar'

export function ContainerLayout({ children }: PropsWithChildren) {
  const { open, isMobile } = useSidebar()

  return (
    <div
      className={cn({
        'grid h-screen grid-cols-[16rem_1fr]': open && !isMobile,
        'grid h-screen grid-cols-[4rem_1fr] items-center justify-center':
          !open && !isMobile,
      })}
    >
      {!!open && <AppSidebar />}
      {!open && <AppClosedSidebar />}
      <main className="flex flex-col">{children}</main>
    </div>
  )
}
