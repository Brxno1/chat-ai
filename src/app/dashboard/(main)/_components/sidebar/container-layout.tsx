'use client'

import { PropsWithChildren } from 'react'

import { ContainerWrapper } from '@/components/container'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/utils/utils'

import { AppClosedSidebar } from './app-closed-sidebar'
import { AppSidebar } from './app-sidebar'

export function ContainerLayout({ children }: PropsWithChildren) {
  const { open, isMobile } = useSidebar()

  return (
    <div
      className={cn('grid h-screen w-full', {
        'grid-cols-[auto_1fr]': !isMobile,
        'grid-cols-1': isMobile,
      })}
    >
      {!isMobile && (
        <ContainerWrapper className="sticky top-0 z-10 h-screen">
          {open ? <AppSidebar /> : <AppClosedSidebar />}
        </ContainerWrapper>
      )}
      <main className="flex flex-col overflow-auto bg-background">
        {children}
      </main>
    </div>
  )
}
