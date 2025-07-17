"use client";

import { AudioLines } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/utils";
import { Button } from "./button";

interface AIVoiceInputProps {
  onStart?: () => void;
  onStop?: (audioBlob: Blob | null, duration: number) => void;
  visualizerBars?: number;
  className?: string;
}

export function AIVoiceInput({
  onStart,
  onStop,
  visualizerBars = 8,
  className,
}: AIVoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioStream = useRef<MediaStream | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRecording) {
      onStart?.();
      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
      if (!mediaRecorder.current) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          audioStream.current = stream;

          mediaRecorder.current = new window.MediaRecorder(stream, {
            mimeType: 'audio/webm',
            audioBitsPerSecond: 64000,
          });

          audioChunks.current = [];

          mediaRecorder.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.current.push(event.data);
            }
          };

          mediaRecorder.current.onstop = () => {
            const audioBlob = audioChunks.current.length > 0 ? new Blob(audioChunks.current, { type: 'audio/webm' }) : null;
            onStop?.(audioBlob, time);
            setTime(0);
            audioStream.current = null;
            mediaRecorder.current = null;
          };
          mediaRecorder.current.start();
        });
      }
    } else {
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.stop();
        if (audioStream.current) {
          audioStream.current.getTracks().forEach((track) => track.stop());
        }
      } else {
        onStop?.(null, time);
        setTime(0);
      }
    }

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, time, onStart, onStop]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRecordToggle = () => {
    setIsRecording((prev) => !prev);
  };

  return (
    <Button
      onClick={handleRecordToggle}
      className={cn('min-w-[6.5rem] shrink-0 gap-2 rounded-xl text-md font-bold', className)}
      type="button"
    >
      {isRecording ? (
        <>
          <div
            className="size-3 rounded-sm animate-spin bg-background cursor-pointer pointer-events-auto"
            style={{ animationDuration: "3s" }}
          />
          <div className="h-4 w-10 flex items-center justify-center gap-0.5">
            {Array.from({ length: visualizerBars }, (_, i) => {
              const barKey = `bar-${visualizerBars}-v-${btoa(String(i * 31 + visualizerBars * 17))}`;

              return (
                <div
                  key={barKey}
                  className="w-1.5 rounded-full transition-all duration-700 bg-background animate-pulse"
                  style={{
                    height: `${20 + Math.random() * 80}%`,
                    animationDelay: `${i * 0.10}s`,
                  }}
                />
              );
            })}
          </div>
        </>
      ) : (
        <>
          <span>Falar</span>
          <AudioLines className="size-5" />
        </>
      )}
    </Button>
  )
}