import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/utils'

type BadgeStatusProps = {
  status: 'PENDING' | 'FINISHED' | 'CANCELLED'
}

export function BadgeStatus({ status }: BadgeStatusProps) {
  let displayStatus: string
  let statusColor: string

  switch (status) {
    case 'FINISHED':
      displayStatus = 'Finalizado'
      statusColor = 'before:bg-green-500'
      break
    case 'PENDING':
      displayStatus = 'Pendente'
      statusColor = 'before:bg-yellow-500'
      break
    case 'CANCELLED':
      displayStatus = 'Cancelado'
      statusColor = 'before:bg-red-500'
      break
  }

  return (
    <Badge
      variant={'outline'}
      className={cn(
        'flex min-w-[6rem] items-center justify-center gap-2 p-2 capitalize before:h-2 before:w-2 before:rounded-full',
        statusColor,
      )}
    >
      <span>{displayStatus}</span>
    </Badge>
  )
}
