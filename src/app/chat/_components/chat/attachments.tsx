'use client'

import type { Message } from '@ai-sdk/react'

import { cn } from '@/utils/utils'

import AudioPlayer from './audio-player'
import { ImagePreview } from './image-preview'

type AttachmentsProps = {
  attachments: Message['experimental_attachments'] | undefined
}
export function Attachments({ attachments }: AttachmentsProps) {
  const imageAttachments = attachments?.filter((attachment) =>
    attachment.contentType?.startsWith('image/'),
  )

  const audioAttachments = attachments?.filter((attachment) =>
    attachment.contentType?.startsWith('audio/'),
  )

  const imageUrls = imageAttachments?.map((attachment) => attachment.url)

  return (
    <>
      {imageUrls && imageUrls.length > 0 && (
        <ImagePreview previewUrls={imageUrls} noRemove />
      )}

      {audioAttachments && audioAttachments.length > 0 && (
        <div
          className={cn(
            'flex flex-col',
            audioAttachments.length > 1 ? 'gap-2' : '',
          )}
        >
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
