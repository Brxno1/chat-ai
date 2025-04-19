import { ImagePlusIcon, XIcon } from 'lucide-react'
import { Session } from 'next-auth'
import React from 'react'

import { ContainerWrapper } from '@/components/container'
import { useImageUpload } from '@/hooks/use-image-upload'

interface AvatarProps {
  user: Session['user']
  onFileChange: (file: File | null) => void
}

export function ProfileAvatar({ user, onFileChange }: AvatarProps) {
  const {
    file,
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  } = useImageUpload()

  React.useEffect(() => {
    onFileChange(file)
  }, [file])

  const currentImage = previewUrl || user.image

  const handleImageRemove = () => {
    handleRemove()
    onFileChange(null)
  }

  return (
    <ContainerWrapper className="-mt-10 flex items-center px-6">
      <ContainerWrapper className="shadow-xs group relative flex size-20 items-center justify-center overflow-hidden rounded-full border border-background shadow-black/10">
        {currentImage ? (
          <img
            src={currentImage}
            className="size-full object-cover"
            width={80}
            height={80}
            alt="Imagem de perfil"
          />
        ) : (
          <div className="flex size-full items-center justify-center rounded-full border-2 border-muted bg-black" />
        )}
        <button
          type="button"
          className="absolute hidden size-7 cursor-pointer items-center justify-center rounded-full outline-none transition-all hover:bg-muted/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 group-hover:flex group-hover:bg-muted/80 dark:text-white"
          onClick={handleThumbnailClick}
          aria-label="Alterar imagem de perfil"
        >
          <ImagePlusIcon size={16} aria-hidden="true" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          aria-label="Carregar imagem de perfil"
          className="hidden"
          accept="image/*"
          onChange={(ev) => {
            handleFileChange(ev)
            onFileChange(ev.target.files?.[0] || null)
          }}
        />
      </ContainerWrapper>
      {previewUrl && (
        <button
          type="button"
          className="group mt-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-none transition-[color,box-shadow] hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-black/60"
          onClick={handleImageRemove}
          aria-label="Remover imagem"
        >
          <XIcon size={16} aria-hidden="true" />
        </button>
      )}
    </ContainerWrapper>
  )
}
