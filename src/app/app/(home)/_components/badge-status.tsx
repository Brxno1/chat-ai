import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type BadgeStatusProps = {
  status: 'pending' | 'finished' | 'cancelled'
}

export function BadgeStatus({ status }: BadgeStatusProps) {
  let displayStatus: string
  let badgeColor: string

  switch (status) {
    case 'finished':
      displayStatus = 'Finalizado'
      badgeColor =
        'bg-green-600 hover:bg-green-600/90 dark:bg-green-600 hover:dark:bg-green-600/90'
      break
    case 'pending':
      displayStatus = 'Pendente'
      badgeColor =
        'bg-yellow-600 hover:bg-yellow-600/90 dark:bg-yellow-600 hover:dark:bg-yellow-600/90'
      break
    case 'cancelled':
      displayStatus = 'Cancelado'
      badgeColor =
        'bg-red-600 hover:bg-red-600/90 dark:bg-red-600 hover:dark:bg-red-600/90'
      break
  }

  return (
    <Badge className={cn('ml-4 capitalize text-white', badgeColor)}>
      {displayStatus}
    </Badge>
  )
}
