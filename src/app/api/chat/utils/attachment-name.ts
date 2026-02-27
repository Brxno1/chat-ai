import { createId } from '@paralleldrive/cuid2'

type AttachmentType = 'image' | 'audio' | 'gif'

type AttachmentConfig = {
  extension: string
  contentType: string
  processBuffer: boolean
}

const ATTACHMENT_CONFIG: Record<AttachmentType, AttachmentConfig> = {
  image: { extension: '.webp', contentType: 'image/webp', processBuffer: true },
  audio: {
    extension: '.webm',
    contentType: 'audio/webm',
    processBuffer: false,
  },
  gif: { extension: '.gif', contentType: 'image/gif', processBuffer: false },
}

function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())

  return `${year}-${month}-${day}_${hours}${minutes}${seconds}`
}

export function resolveAttachmentType(contentType: string): AttachmentType {
  if (contentType.startsWith('audio/')) return 'audio'
  if (contentType === 'image/gif') return 'gif'
  return 'image'
}

export function getAttachmentConfig(
  contentType: string,
): AttachmentConfig & { type: AttachmentType } {
  const type = resolveAttachmentType(contentType)
  return { type, ...ATTACHMENT_CONFIG[type] }
}

export function generateAttachmentName(type: AttachmentType): string {
  const date = formatDate(new Date())
  const uid = createId()
  const ext = ATTACHMENT_CONFIG[type].extension

  return `${type}_${date}_${uid}${ext}`
}
