"use client";

import { Loader2, Mic } from "lucide-react";
import React from "react";
import { cn } from "@/utils/utils";
import { Button } from "./button";
import { useChatContext } from "@/context/chat";

interface AIVoiceInputProps {
  visualizerBars?: number;
  className?: string;
}

export function AIVoiceInput({
  visualizerBars = 8,
  className,
}: AIVoiceInputProps) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [time, setTime] = React.useState(0);

  const mediaRecorder = React.useRef<MediaRecorder | null>(null);
  const audioStream = React.useRef<MediaStream | null>(null);
  const audioChunks = React.useRef<Blob[]>([]);

  const { onGenerateTranscribe, isTranscribing } = useChatContext()

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRecording) {
      audioChunks.current = [];

      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);

      if (!mediaRecorder.current) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          audioStream.current = stream;

          mediaRecorder.current = new window.MediaRecorder(stream, {
            mimeType: 'audio/webm',
            audioBitsPerSecond: 64_000,
          });

          mediaRecorder.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.current.push(event.data);
            }
          };

          mediaRecorder.current.onstop = () => {
            const audioBlob = audioChunks.current.length > 0 ? new Blob(audioChunks.current, { type: 'audio/webm' }) : null;

            onGenerateTranscribe(audioBlob);
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
        onGenerateTranscribe(null);
        setTime(0);
      }
    }

    return () => clearInterval(intervalId);
  }, [isRecording, time]);

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
      className={cn('min-w-[3rem] rounded-lg text-md font-bold', className)}
      type="button"
      onClick={handleRecordToggle}
      disabled={isTranscribing}
    >
      {isRecording ? (
        <div className="h-4 w-14 flex items-center justify-center gap-0.5">
          {Array.from({ length: visualizerBars }, (_, i) => {
            const barKey = `bar-${visualizerBars}-v-${btoa(String(i * 31 + visualizerBars * 17))}`;

            return (
              <div
                key={barKey}
                className="w-1.5 rounded-full transition-all duration-700 bg-background animate-pulse"
                style={{
                  height: `${25 + Math.random() * 75}%`,
                  animationDelay: `${i * 0.10}s`,
                }}
              />
            );
          })}
        </div>
      ) : isTranscribing ? (
        <div
          className="size-3 rounded-sm animate-spin bg-background cursor-pointer pointer-events-auto"
          style={{ animationDuration: "3s" }}
        />
      ) : <Mic size={16} />}
    </Button>
  )
}