import { CheckCircleIcon, ClockIcon, XCircleIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/utils'

type StatusType = 'PENDING' | 'FINISHED' | 'CANCELLED'

type BadgeConfig = {
  label: string
  color?: string
  icon?: React.ReactNode
}

const badge: Record<StatusType, BadgeConfig> = {
  FINISHED: {
    label: 'Finalizado',
    color:
      'bg-emerald-300/30 dark:bg-emerald-800/20 text-emerald-600 dark:text-emerald-400',
    icon: <CheckCircleIcon size={16} />,
  },
  PENDING: {
    label: 'Pendente',
    color:
      'bg-yellow-300/30 dark:bg-yellow-800/20 text-yellow-600 dark:text-yellow-400',
    icon: <ClockIcon size={16} />,
  },
  CANCELLED: {
    label: 'Cancelado',
    color:
      'bg-rose-300/30 dark:bg-rose-800/20 text-rose-600 dark:text-rose-400',
    icon: <XCircleIcon size={16} />,
  },
}

export function BadgeStatus({ status }: { status: StatusType }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'flex items-center justify-around border p-2 capitalize md:min-w-[7.5rem]',
        badge[status].color,
      )}
    >
      {badge[status].icon}
      <span className="hidden text-xs md:block">{badge[status].label}</span>
    </Badge>
  )
}
