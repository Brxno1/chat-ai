'use client'

import type { Message } from '@ai-sdk/react'

import AudioPlayer from './audio-player'
import { ImagePreview } from './image-preview'

type AttachmentsProps = {
  attachments: Message['experimental_attachments']
}
export function Attachments({ attachments }: AttachmentsProps) {
  if (!attachments) return null

  const imageAttachments = attachments.filter((attachment) =>
    attachment.contentType?.startsWith('image/'),
  )

  const audioAttachments = attachments?.filter((attachment) =>
    attachment.contentType?.startsWith('audio/'),
  )

  const imageUrls = imageAttachments?.map((attachment) => attachment.url)

  return (
    <>
      {imageUrls && imageUrls.length > 0 && (
        <ImagePreview
          previewUrls={imageUrls}
          noRemove
          className="size-14 rounded-md"
        />
      )}

      {audioAttachments && audioAttachments.length > 0 && (
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
