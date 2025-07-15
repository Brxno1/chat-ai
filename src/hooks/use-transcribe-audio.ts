import { useMutation } from '@tanstack/react-query'

import { api } from '@/lib/axios'

type TranscriptionResponse = {
  transcription: string
}

export function useTranscribeAudio() {
  return useMutation({
    mutationKey: ['transcribe-audio'],
    mutationFn: async (audio: Blob): Promise<TranscriptionResponse> => {
      const formData = new FormData()
      formData.append('audio', audio, 'audio.webm')

      const { data } = await api.post<TranscriptionResponse>(
        `/chat/transcribre`,
        formData,
      )

      return data
    },
  })
}
