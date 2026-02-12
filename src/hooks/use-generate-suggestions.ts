import { useMutation } from '@tanstack/react-query'
import { type UIMessage } from 'ai'

import { api } from '@/lib/axios'

export type GenerateSuggestionsResponse = {
  id: string
  role: 'assistant'
  content: string
}

export function useGenerateSuggestions() {
  return useMutation({
    mutationKey: ['generate-suggestions'],
    mutationFn: async ({
      message,
    }: {
      message: UIMessage
    }): Promise<GenerateSuggestionsResponse[]> => {
      const { data } = await api.post<GenerateSuggestionsResponse[]>(
        `/chat/suggestions`,
        { message },
      )

      return data.slice(0, 3)
    },
  })
}
