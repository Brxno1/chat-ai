import { Brain, Feather, type LucideIcon, Sparkles, Zap } from 'lucide-react'

import { ModelTier } from '@/types/model'

export const tierIcons: Record<ModelTier, LucideIcon> = {
  flash: Zap,
  lite: Feather,
  pro: Brain,
  thinking: Sparkles,
}

type ModelTierIconProps = {
  tier?: ModelTier
  className?: string
}

export function ModelTierIcon({
  tier,
  className = 'size-4',
}: ModelTierIconProps) {
  const Icon = tier ? tierIcons[tier] : Zap
  return <Icon className={className} />
}
