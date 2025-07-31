'use client'

import { Mic } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { useChatInstance } from '@/context/chat'
import { cn } from '@/utils/utils'

interface RecorderAudioProps {
  visualizerBars?: number
  className?: string
  onSetAudio: (audio: File) => void
  isSubmitting?: boolean
}

export function RecorderAudio({
  visualizerBars = 8,
  className,
  onSetAudio,
  isSubmitting,
}: RecorderAudioProps) {
  const [isRecording, setIsRecording] = React.useState(false)
  const [time, setTime] = React.useState(0)

  const mediaRecorder = React.useRef<MediaRecorder | null>(null)
  const audioStream = React.useRef<MediaStream | null>(null)
  const audioChunks = React.useRef<Blob[]>([])

  const { onAudioRecorded, isTranscribing } = useChatInstance()

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (isRecording) {
      audioChunks.current = []

      intervalId = setInterval(() => {
        setTime((time) => time + 1)
      }, 1000)

      if (!mediaRecorder.current) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          audioStream.current = stream

          mediaRecorder.current = new window.MediaRecorder(stream, {
            mimeType: 'audio/webm',
            audioBitsPerSecond: 64_000,
          })

          mediaRecorder.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.current.push(event.data)
            }
          }

          mediaRecorder.current.onstop = () => {
            const audioBlob =
              audioChunks.current.length > 0
                ? new Blob(audioChunks.current, { type: 'audio/webm' })
                : null

            onAudioRecorded(audioBlob, onSetAudio)
            // onGenerateTranscribe(audioBlob);
            setTime(0)

            audioStream.current = null
            mediaRecorder.current = null
          }
          mediaRecorder.current.start()
        })
      }
    } else {
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.stop()

        if (audioStream.current) {
          audioStream.current.getTracks().forEach((track) => track.stop())
        }
      } else {
        setTime(0)
      }
    }

    return () => clearInterval(intervalId)
  }, [isRecording, onAudioRecorded])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleRecordToggle = () => {
    setIsRecording((prev) => !prev)
  }

  return (
    <Button
      className={cn(
        'text-md group min-w-[3rem] rounded-lg font-bold',
        className,
      )}
      type="button"
      onClick={handleRecordToggle}
      disabled={isSubmitting}
    >
      {isRecording ? (
        <div className="flex h-4 w-14 items-center justify-center gap-0.5">
          {Array.from({ length: visualizerBars }, (_, i) => {
            const barKey = `bar-${visualizerBars}-v-${btoa(String(i * 31 + visualizerBars * 17))}`

            return (
              <div
                key={barKey}
                className="w-1.5 animate-pulse rounded-full bg-background transition-all duration-700"
                style={{
                  height: `${25 + Math.random() * 75}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            )
          })}
        </div>
      ) : isSubmitting || isTranscribing ? (
        <div
          className="pointer-events-auto size-3 animate-spin cursor-pointer rounded-sm bg-background"
          style={{ animationDuration: '3s' }}
        />
      ) : (
        <Mic size={16} />
      )}
    </Button>
  )
}
