import { cn } from '@/utils/utils'

type ContainerGenericProps<T = unknown> = {
  children: React.ReactNode
  className?: string
} & T

export function ContainerWrapper({
  children,
  className,
}: ContainerGenericProps) {
  return <div className={cn(className)}>{children}</div>
}
