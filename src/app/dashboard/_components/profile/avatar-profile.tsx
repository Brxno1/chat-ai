import { ArrowRightLeft, ImagePlusIcon, XIcon } from 'lucide-react'
import Image from 'next/image'
import { User } from 'next-auth'
import React from 'react'

import { ContainerWrapper } from '@/components/container'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Input } from '@/components/ui/input'
import { useImageUpload } from '@/hooks/use-image-upload'
import { formatDataToLocale, formatFileSize } from '@/utils/format'
import { truncateText } from '@/utils/truncate-text'

interface AvatarProps {
  user: User
  error?: string
  onFileChange: ({ name, file }: { name: 'avatar'; file: File | null }) => void
}

function AvatarProfile({ user, onFileChange, error }: AvatarProps) {
  const {
    file,
    fileName,
    fileSize,
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  } = useImageUpload()

  React.useEffect(() => {
    onFileChange({ name: 'avatar', file })
  }, [file])

  const currentImage = previewUrl || user.image

  const handleRemoveImage = () => {
    handleRemove()
    onFileChange({ name: 'avatar', file: null })
  }

  return (
    <ContainerWrapper className="-mt-10 flex items-center px-6">
      <div className="shadow-xs group relative flex size-20 items-center justify-center overflow-hidden rounded-full shadow-black/10">
        {currentImage && (
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
                      text: fileName!,
                      maxLength: 17,
                    })}
                  </span>
                </p>
                <p className="text-sm">
                  Tipo:{' '}
                  <span className="text-muted-foreground">{file!.type}</span>
                </p>
                <p className="text-sm">
                  Tamanho:{' '}
                  <span className="text-muted-foreground">
                    {fileSize ? formatFileSize(fileSize) : '0 B'}
                  </span>
                </p>
                <p className="text-sm">
                  Modificado em:{' '}
                  <span className="text-muted-foreground">
                    {formatDataToLocale(new Date(file!.lastModified))}
                  </span>
                </p>
              </HoverCardContent>
            )}
          </HoverCard>
        )}
        <button
          type="button"
          className="absolute hidden size-7 cursor-pointer items-center justify-center rounded-full bg-muted text-primary outline-none transition-all hover:bg-muted/90 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 group-hover:flex"
          onClick={handleThumbnailClick}
          aria-label="Alterar imagem de perfil"
        >
          {currentImage ? (
            <ArrowRightLeft size={16} aria-hidden="true" />
          ) : (
            <ImagePlusIcon size={16} aria-hidden="true" />
          )}
        </button>
        <Input
          type="file"
          ref={fileInputRef}
          aria-label="Carregar imagem de perfil"
          className="hidden"
          accept="image/*"
          onChange={(ev) => {
            handleFileChange(ev)
            onFileChange({ name: 'avatar', file: ev.target.files?.[0] || null })
          }}
        />
      </div>
      {previewUrl && (
        <button
          type="button"
          className="mt-10 flex size-6 cursor-pointer items-center justify-center rounded-full bg-muted text-primary outline-none transition-all hover:border hover:border-border focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          onClick={handleRemoveImage}
          aria-label="Remover imagem"
        >
          <XIcon size={16} aria-hidden="true" />
        </button>
      )}
      {error && (
        <span className="ml-auto mt-10 text-xs text-red-600">{error}</span>
      )}
    </ContainerWrapper>
  )
}

function AvatarProfileFallback({ user }: { user: User }) {
  return (
    <div className="-mt-10 flex items-center px-6">
      <div className="shadow-xs flex size-20 items-center justify-center overflow-hidden rounded-full shadow-black/10">
        <Avatar className="size-20">
          <AvatarFallback className="rounded-sm font-semibold">
            {user.name!.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}

export { AvatarProfile, AvatarProfileFallback }
