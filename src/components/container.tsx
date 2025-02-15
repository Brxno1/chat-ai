import { cn } from '@/lib/utils'

type ContainerGenericProps<T = unknown> = {
  children: React.ReactNode
  className?: string
} & T

export default function Container({
  children,
  className,
}: ContainerGenericProps) {
  return <div className={cn(['', className])}>{children}</div>
}
