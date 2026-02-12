export type ModelTier = 'flash' | 'lite' | 'pro' | 'thinking'

export type Model = {
  id: string
  name: string
  provider: string
  premium?: boolean
  disabled?: boolean
  tier?: ModelTier
}

