'use client'

import { Mic, StopCircle } from 'lucide-react'
import React from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

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

  useHotkeys('shift+r', () => {
    handleRecordToggle()
  })

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
      {isRecording ? <StopCircle className="size-4" /> : <Mic size={16} />}
    </Button>
  )
}
