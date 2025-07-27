/* eslint-disable */

'use client'

import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/utils/utils'

interface AudioPlayerProps {
  src: string
  minimal?: boolean
  className?: string
}

export default function AudioPlayer({
  src,
  minimal = false,
  className = '',
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isLooping, setIsLooping] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)

  const waveformBars = Array.from({ length: minimal ? 20 : 60 }, (_, index) => ({
    height: Math.random() * 100 + 10,
    played: index / (minimal ? 20 : 60) < currentTime / duration,
  }))

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', () => setIsPlaying(false))

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', () => setIsPlaying(false))
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = (value[0] / 100) * duration
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = value[0] / 100
    audio.volume = newVolume
    setVolume(newVolume)
  }

  const toggleLoop = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.loop = !!isLooping
    setIsLooping(!isLooping)
  }

  const skipBackward = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = Math.max(0, audio.currentTime - 10)
  }

  const skipForward = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = Math.min(duration, audio.currentTime + 10)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  if (minimal) {
    return (
      <div
        className={cn(
          'max-w-md rounded-lg border bg-primary/10 p-4 shadow-sm dark:border-border',
          className,
        )}
      >
        <audio ref={audioRef} src={src} />

        <div className="flex items-center gap-3">
          <Button
            onClick={togglePlay}
            className="h-8 w-8 p-0"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <div className="flex items-center gap-2">
            <div className="flex h-8 items-end gap-0.5">
              {waveformBars.map((bar, index) => (
                <div
                  key={index}
                  className={`w-1 rounded-sm transition-colors ${bar.played ? 'bg-primary' : 'bg-primary/60'
                    }`}
                  style={{ height: `${(bar.height / 100) * 24}px` }}
                />
              ))}
            </div>
          </div>
          <span className="min-w-[40px] font-mono text-sm text-muted-foreground">
            {formatTime(currentTime)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'max-w-lg rounded-lg border bg-card p-6 shadow-sm dark:border-border',
        className,
      )}
    >
      <audio ref={audioRef} src={src} />

      {/* Waveform and Time Display */}
      <div className="mb-6 flex items-center gap-4">
        <span className="min-w-[40px] font-mono text-sm text-muted-foreground">
          {formatTime(currentTime)}
        </span>

        <div className="relative flex-1">
          <div className="flex h-12 cursor-pointer items-end gap-0.5">
            {waveformBars.map((bar, index) => (
              <div
                key={index}
                className={`w-1 rounded-sm transition-colors ${bar.played ? 'bg-primary' : 'bg-muted'
                  }`}
                style={{ height: `${(bar.height / 100) * 40}px` }}
                onClick={() =>
                  handleSeek([(index / waveformBars.length) * 100])
                }
              />
            ))}
          </div>
        </div>

        <span className="min-w-[40px] font-mono text-sm text-muted-foreground">
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLoop}
          className={`h-8 w-8 p-0 ${isLooping ? 'text-primary' : 'text-muted-foreground'
            }`}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={skipBackward}
            className="h-8 w-8 p-0"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={togglePlay}
            className="h-10 w-10 rounded-full p-0"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={skipForward}
            className="h-8 w-8 p-0"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume * 100]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="w-16"
          />
        </div>
      </div>
    </div>
  )
}
