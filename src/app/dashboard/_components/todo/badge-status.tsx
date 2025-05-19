import { CheckCircleIcon, ClockIcon, XCircleIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/utils'

type StatusType = 'PENDING' | 'FINISHED' | 'CANCELLED'

type BadgeConfig = {
  label: string
  color: string
  icon: React.ReactNode
}

type BadgeStatusProps = {
  status: StatusType
}

const badge: Record<StatusType, BadgeConfig> = {
  FINISHED: {
    label: 'Finalizado',
    color:
      'bg-emerald-50 dark:bg-emerald-300/10 text-emerald-600 border-emerald-600 dark:text-emerald-600',
    icon: <CheckCircleIcon size={16} />,
  },
  PENDING: {
    label: 'Pendente',
    color:
      'bg-yellow-50 dark:bg-yellow-300/10 text-yellow-600 border-yellow-600 dark:text-yellow-600',
    icon: <ClockIcon size={16} />,
  },
  CANCELLED: {
    label: 'Cancelado',
    color:
      'bg-rose-50 dark:bg-rose-300/10 text-rose-600 border-rose-600 dark:text-rose-600',
    icon: <XCircleIcon size={16} />,
  },
}

export function BadgeStatus({ status }: BadgeStatusProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'flex min-w-[7rem] items-center justify-center gap-4 border p-1.5 capitalize',
        badge[status].color,
      )}
    >
      {badge[status].icon}
      <span>{badge[status].label}</span>
    </Badge>
  )
}
