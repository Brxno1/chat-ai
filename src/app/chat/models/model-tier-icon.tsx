import { ModelTier } from "@/types/model";
import { type LucideIcon, Zap, Feather, Brain, Sparkles } from "lucide-react";

export const tierIcons: Record<ModelTier, LucideIcon> = {
  flash: Zap,
  lite: Feather,
  pro: Brain,
  thinking: Sparkles,
};

type ModelTierIconProps = {
  tier?: ModelTier;
  className?: string;
};

export function ModelTierIcon({ tier, className = "size-4" }: ModelTierIconProps) {
  const Icon = tier ? tierIcons[tier] : Zap;
  return <Icon className={className} />;
}
