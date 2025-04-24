'use client'

import { PropsWithChildren } from 'react'

import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/utils/utils'

import { AppClosedSidebar } from './app-closed-sidebar'
import { AppSidebar } from './app-sidebar'

export function ContainerLayout({ children }: PropsWithChildren) {
  const { open, isMobile } = useSidebar()

  return (
    <div
      className={cn({
        'grid h-screen grid-cols-[16rem_1fr]': open && !isMobile,
        'grid h-screen grid-cols-[4rem_1fr] items-start justify-center':
          !open && !isMobile,
      })}
    >
      <div className="sticky top-0 h-screen">
        {!!open && <AppSidebar />}
        {!open && <AppClosedSidebar />}
      </div>
      <main className="flex flex-col overflow-hidden">{children}</main>
    </div>
  )
}
