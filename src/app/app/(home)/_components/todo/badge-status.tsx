import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/utils'

type BadgeStatusProps = {
  status: 'pending' | 'finished' | 'cancelled'
}

export function BadgeStatus({ status }: BadgeStatusProps) {
  let displayStatus: string
  let statusColor: string

  switch (status) {
    case 'finished':
      displayStatus = 'Finalizado'
      statusColor = 'before:bg-green-500'
      break
    case 'pending':
      displayStatus = 'Pendente'
      statusColor = 'before:bg-yellow-500'
      break
    case 'cancelled':
      displayStatus = 'Cancelado'
      statusColor = 'before:bg-red-500'
      break
  }

  return (
    <Badge
      variant={'outline'}
      className={cn(
        'p-2 capitalize before:mr-2 before:h-2 before:w-2 before:rounded-full',
        statusColor,
      )}
    >
      <span>{displayStatus}</span>
    </Badge>
  )
}
