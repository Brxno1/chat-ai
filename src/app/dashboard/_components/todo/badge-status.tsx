import { CheckCircleIcon, ClockIcon, XCircleIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/utils'

type StatusType = 'PENDING' | 'FINISHED' | 'CANCELLED'

type BadgeConfig = {
  label: string
  color?: string
  icon?: React.ReactNode
}

type BadgeStatusProps = {
  status: StatusType
}

const badge: Record<StatusType, BadgeConfig> = {
  FINISHED: {
    label: 'Finalizado',
    icon: <CheckCircleIcon size={16} className="text-emerald-500" />,
  },
  PENDING: {
    label: 'Pendente',
    icon: <ClockIcon size={16} className="text-yellow-500" />,
  },
  CANCELLED: {
    label: 'Cancelado',
    icon: <XCircleIcon size={16} className="text-rose-500" />,
  },
}

export function BadgeStatus({ status }: BadgeStatusProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'flex min-w-[7.5rem] items-center justify-around border p-2 capitalize',
      )}
    >
      {badge[status].icon}
      <span>{badge[status].label}</span>
    </Badge>
  )
}
