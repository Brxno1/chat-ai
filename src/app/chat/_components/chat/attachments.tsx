'use client'

import { type Message } from '@ai-sdk/react'

import { ImagePreview } from './image-preview'

type AttachmentsProps = {
  attachments: Message['experimental_attachments'] | undefined
}

export function Attachments({ attachments }: AttachmentsProps) {
  const allUrls = attachments?.map((attachment) => attachment.url)

  return <ImagePreview previewUrls={allUrls!} noRemove />
}
