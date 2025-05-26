'use client'

import Link from 'next/link'

import { cn } from '@/utils/utils'

export type SidebarGenericProps<T = unknown> = {
  children: React.ReactNode
  className?: string
} & T

function Sidebar({ className, children }: SidebarGenericProps) {
  return (
    <aside
      className={cn([
        'flex h-full flex-col space-y-6 border-r border-border',
        className,
      ])}
    >
      {children}
    </aside>
  )
}

function SidebarHeader({ className, children }: SidebarGenericProps) {
  return <header className={cn(className)}>{children}</header>
}

function SidebarHeaderTitle({ className, children }: SidebarGenericProps) {
  return <h1 className={cn(className)}>{children}</h1>
}

function SidebarMain({ className, children }: SidebarGenericProps) {
  return <main className={cn('px-3', className)}>{children}</main>
}

function SidebarNav({ className, children }: SidebarGenericProps) {
  return <nav className={cn(className)}>{children}</nav>
}

function SidebarNavHeader({ className, children }: SidebarGenericProps) {
  return <header className={cn(className)}>{children}</header>
}

function SidebarNavHeaderTitle({ className, children }: SidebarGenericProps) {
  return (
    <h1
      className={cn(
        'ml-3 text-[0.6rem] uppercase text-muted-foreground',
        className,
      )}
    >
      {children}
    </h1>
  )
}

function SidebarNavMain({ className, children }: SidebarGenericProps) {
  return <main className={cn('space-y-2', className)}>{children}</main>
}

type SidebarNavLinkProps = {
  href: string
  active?: boolean
  onClick?: () => void
}

function SidebarNavLink({
  className,
  children,
  active,
  href,
  onClick,
}: SidebarGenericProps<SidebarNavLinkProps>) {
  return (
    <Link
      href={href}
      prefetch={false}
      onClick={() => onClick?.()}
      className={cn(
        'flex items-center rounded-md text-primary py-1.5 text-sm transition-all hover:bg-gradient-to-r hover:from-muted/20 hover:to-indigo-600/40 hover:border-border',
        className,
        {
          'cursor-default bg-indigo-600/40 text-primary hover:bg-indigo-600/50 font-semibold':
            active,
        },
      )}
    >
      {children}
    </Link>
  )
}

function SidebarFooter({ className, children }: SidebarGenericProps) {
  return (
    <footer
      className={cn(
        'mt-auto flex items-center border-t border-border p-4',
        className,
      )}
    >
      {children}
    </footer>
  )
}

export {
  Sidebar,
  SidebarHeader,
  SidebarNavMain,
  SidebarNavLink,
  SidebarNavHeader,
  SidebarMain,
  SidebarFooter,
  SidebarHeaderTitle,
  SidebarNav,
  SidebarNavHeaderTitle,
}
