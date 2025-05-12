'use client'

import Image from 'next/image'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { formatDateToLocale, formatFileSize } from '@/utils/format'
import { truncateText } from '@/utils/truncate-text'

type AvatarDetailsProps = {
  currentImage: string
  previewUrl: string
  file: File | null
}

export function AvatarDetails({
  currentImage,
  previewUrl,
  file,
}: AvatarDetailsProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Image
          src={currentImage}
          className="size-full object-cover"
          width={80}
          height={80}
          alt="Imagem de perfil"
        />
      </HoverCardTrigger>
      {previewUrl && (
        <HoverCardContent className="flex w-[13rem] flex-col items-start gap-1">
          <p className="text-sm">
            Nome:{' '}
            <span className="text-muted-foreground">
              {truncateText({
                text: file?.name || '',
                maxLength: 17,
              })}
            </span>
          </p>
          <p className="text-sm">
            Tipo:{' '}
            <span className="text-muted-foreground">{file?.type || ''}</span>
          </p>
          <p className="text-sm">
            Tamanho:{' '}
            <span className="text-muted-foreground">
              {formatFileSize(file?.size || 0)}
            </span>
          </p>
          <p className="text-sm">
            Modificado em:{' '}
            <span className="text-muted-foreground">
              {formatDateToLocale(new Date(file?.lastModified || 0))}
            </span>
          </p>
        </HoverCardContent>
      )}
    </HoverCard>
  )
}
