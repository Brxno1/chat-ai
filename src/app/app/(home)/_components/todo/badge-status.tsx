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
      statusColor = 'before:bg-green-500 hover:border-green-500'
      break
    case 'PENDING':
      displayStatus = 'Pendente'
      statusColor = 'before:bg-yellow-500 hover:border-yellow-500'
      break
    case 'CANCELLED':
      displayStatus = 'Cancelado'
      statusColor = 'before:bg-red-500 hover:border-red-500'
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
