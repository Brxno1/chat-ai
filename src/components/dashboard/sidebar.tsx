import Link from 'next/link'

import { cn } from '@/lib/utils'

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
  return <header className={cn(['', className])}>{children}</header>
}

function SidebarHeaderTitle({ className, children }: SidebarGenericProps) {
  return <h1 className={cn(['', className])}>{children}</h1>
}

function SidebarMain({ className, children }: SidebarGenericProps) {
  return <main className={cn(['px-3', className])}>{children}</main>
}

function SidebarNav({ className, children }: SidebarGenericProps) {
  return <nav className={cn(['', className])}>{children}</nav>
}

function SidebarNavHeader({ className, children }: SidebarGenericProps) {
  return <header className={cn(['', className])}>{children}</header>
}

function SidebarNavHeaderTitle({ className, children }: SidebarGenericProps) {
  return (
    <div
      className={cn([
        'ml-3 text-[0.6rem] uppercase text-muted-foreground',
        className,
      ])}
    >
      {children}
    </div>
  )
}

function SidebarNavMain({ className, children }: SidebarGenericProps) {
  return <main className={cn(['', className])}>{children}</main>
}

type DashboardSidebarNavLinkProps = {
  href: string
  active?: boolean
}

function SidebarNavLink({
  className,
  children,
  href,
  active,
}: SidebarGenericProps<DashboardSidebarNavLinkProps>) {
  return (
    <Link
      href={href}
      className={cn([
        'flex items-center rounded-md px-3 py-2 text-xs hover:bg-muted',
        active && 'cursor-default bg-muted',
        className,
      ])}
    >
      {children}
    </Link>
  )
}

function SidebarFooter({ className, children }: SidebarGenericProps) {
  return (
    <footer
      className={cn([
        'mt-auto flex items-center border-t border-border p-4',
        className,
      ])}
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
