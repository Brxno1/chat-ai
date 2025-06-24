import { cn } from '@/utils/utils'

export type DashboardPageGenericProps<T = unknown> = {
  children: React.ReactNode
  className?: string
} & T

export function DashboardPage({
  className,
  children,
}: DashboardPageGenericProps) {
  return (
    <section className={cn(['flex min-h-0 overflow-auto flex-col', className])}>
      {children}
    </section>
  )
}

export function DashboardPageHeader({
  className,
  children,
}: DashboardPageGenericProps) {
  return (
    <header
      className={cn([
        'sticky top-0 z-[1] flex w-full items-center justify-between px-5 py-3',
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
  return <nav className={cn(className)}>{children}</nav>
}

export function DashboardPageMain({
  className,
  children,
}: DashboardPageGenericProps) {
  return (
    <main className={cn(['flex-1 overflow-auto p-2 md:p-6', className])}>
      {children}
    </main>
  )
}
