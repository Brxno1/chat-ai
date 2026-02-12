'use client'

import type { Message } from '@ai-sdk/react'

import AudioPlayer from './audio-player'
import { ImagePreview } from './image-preview'

type AttachmentsProps = {
  attachments: Message['experimental_attachments']
}
export function Attachments({ attachments }: AttachmentsProps) {
  if (!attachments) return null

  const { images, audioAttachments } = attachments.reduce(
    (acc, attachment) => {
      if (attachment.contentType?.startsWith('image/')) {
        acc.images.push({ url: attachment.url, name: attachment.name })
      } else if (attachment.contentType?.startsWith('audio/')) {
        acc.audioAttachments.push(attachment)
      }
      return acc
    },
    {
      images: [] as { url: string; name?: string }[],
      audioAttachments: [] as NonNullable<typeof attachments>,
    },
  )

  return (
    <>
      {images.length > 0 && (
        <ImagePreview
          images={images}
          noRemove
          className="size-16 rounded-md"
        />
      )}

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
