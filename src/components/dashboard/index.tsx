import { cn } from '@/lib/utils'

export type DashboardPageGenericProps<T = unknown> = {
  children: React.ReactNode
  className?: string
} & T

export function DashboardPage({
  className,
  children,
}: DashboardPageGenericProps) {
  return <section className={cn(['h-screen', className])}>{children}</section>
}

export function DashboardPageHeader({
  className,
  children,
}: DashboardPageGenericProps) {
  return (
    <header
      className={cn([
        'flex justify-between border-b border-border py-2',
        className,
      ])}
    >
      {children}
    </header>
  )
}

export function DashboardPageHeaderTitle({
  className,
  children,
}: DashboardPageGenericProps) {
  return (
    <h1 className={cn(['text-base font-bold uppercase', className])}>
      {children}
    </h1>
  )
}

export function DashboardPageHeaderNav({
  className,
  children,
}: DashboardPageGenericProps) {
  return <nav className={cn(['', className])}>{children}</nav>
}

export function DashboardPageMain({
  className,
  children,
}: DashboardPageGenericProps) {
  return <main className={cn(['p-6', className])}>{children}</main>
}
