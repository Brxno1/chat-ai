'use client'

import { User } from 'next-auth'

import { useLayoutStyle, useSidebarPosition } from '@/hooks/use-layout'
import { cn } from '@/utils/utils'

import { AppSidebar } from './sidebar/app-sidebar'

type ContainerLayoutProps = {
  children: React.ReactNode
  initialUser?: User
  maxWidth?: string
}

export function MainWrapperLayout({
  children,
  initialUser,
  maxWidth = '1400px',
}: ContainerLayoutProps) {
  const { containerRef, sidebarOffset, isPositionCalculated } =
    useSidebarPosition()
  const { containerClass, contentStyle } = useLayoutStyle(maxWidth)

  return (
    <div className={cn('flex h-screen w-full', containerClass)}>
      <main
        ref={containerRef}
        className="grid h-screen w-full grid-cols-[minmax(4rem,auto)_1fr] space-x-px transition-all"
        style={contentStyle}
      >
        <div
          className={cn(
            'transition-opacity duration-200',
            !isPositionCalculated && 'opacity-0',
          )}
        >
          <AppSidebar initialUser={initialUser!} offsetLeft={sidebarOffset} />
        </div>
        <div
          className="flex flex-col overflow-hidden"
          aria-label="Conteúdo principal"
        >
          {children}
        </div>
      </main>
    </div>
  )
}
