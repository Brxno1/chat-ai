import { GradientText } from '@/components/react-bits/GradientText/GradientText'
import { useSessionUser } from '@/context/user'

import { SuggestionCards } from './suggestion'

export function ChatWelcome() {
  const { user } = useSessionUser()

  return (
    <div className="flex h-full flex-col items-center justify-center gap-10">
      {user && (
        <GradientText
          colors={['#ff2894', '#7216ce', '#0063d4', '#55ccff']}
          className="text-4xl"
        >
          Olá, {user.name}!
        </GradientText>
      )}
      <SuggestionCards />
    </div>
  )
}
