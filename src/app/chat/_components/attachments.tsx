'use client'

import type { UIMessage } from 'ai'

import AudioPlayer from './audio-player'
import { ImagePreview } from './image-preview'

type FilePart = Extract<UIMessage['parts'][number], { type: 'file' }>

type AttachmentsProps = {
  parts: UIMessage['parts']
}

export function Attachments({ parts }: AttachmentsProps) {
  const fileParts = parts.filter(
    (part): part is FilePart => part.type === 'file',
  )

  if (fileParts.length === 0) return null

  const { images, audioAttachments } = fileParts.reduce(
    (acc, part) => {
      if (part.mediaType?.startsWith('image/')) {
        acc.images.push({ url: part.url, name: part.filename })
      } else if (part.mediaType?.startsWith('audio/')) {
        acc.audioAttachments.push(part)
      }
      return acc
    },
    {
      images: [] as { url: string; name?: string }[],
      audioAttachments: [] as FilePart[],
    },
  )

  return (
    <>
      {images.length > 0 && <ImagePreview images={images} noRemove />}

      {audioAttachments.length > 0 && (
        <div>
          {audioAttachments.map((audio, index) => (
            <AudioPlayer
              key={`audio-${index}`}
              src={audio.url}
              minimal
              className="w-full"
            />
          ))}
        </div>
      )}
    </>
  )
}
