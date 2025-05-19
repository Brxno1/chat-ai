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
    <section className={cn(['flex h-screen flex-col', className])}>
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
        'sticky top-0 z-10 flex w-full border-b items-center justify-end gap-3 bg-muted px-6 py-3 drop-shadow-md dark:bg-background',
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
    <main className={cn(['flex-1 overflow-auto p-6', className])}>
      {children}
    </main>
  )
}
