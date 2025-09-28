import { useMutation } from '@tanstack/react-query'
import { type Message } from 'ai'

import { api } from '@/lib/axios'

export type GenerateSuggestionsResponse = {
  id: string
  role: 'assistant'
  content: string
}[]

export function useGenerateSuggestions() {
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['generate-suggestions'],
    mutationFn: async ({
      messages,
    }: {
      messages: Message
    }): Promise<GenerateSuggestionsResponse> => {
      const { data } = await api.post<GenerateSuggestionsResponse>(
        `/chat/suggestions`,
        { messages: [messages] },
      )

      return data
    },
  })

  return {
    mutateAsync,
    isPending,
  }
}
