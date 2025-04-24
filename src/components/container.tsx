import { cn } from '@/utils/utils'

type ContainerWrapperProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
  ref?: React.RefObject<HTMLDivElement>
}

export function ContainerWrapper({
  children,
  className,
  ref,
  ...props
}: ContainerWrapperProps) {
  return (
    <div className={cn(className)} ref={ref} {...props}>
      {children}
    </div>
  )
}
