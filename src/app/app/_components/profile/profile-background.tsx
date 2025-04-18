import { ImagePlusIcon, XIcon } from 'lucide-react'
import { Session } from 'next-auth'
import React from 'react'

import { ContainerWrapper } from '@/components/container'
import { Button } from '@/components/ui/button'
import { useImageUpload } from '@/hooks/use-image-upload'

interface FileUploadProps {
  user: Session['user']
  onFileChange: (file: File | null) => void
}

export function ProfileBackground({ user, onFileChange }: FileUploadProps) {
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

  const currentBackground = previewUrl || user.background

  const handleImageRemove = () => {
    handleRemove()
    onFileChange(null)
  }

  const handleFileInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(ev)
    onFileChange(ev.target.files?.[0] || null)
  }

  return (
    <ContainerWrapper className="h-32">
      <ContainerWrapper className="group relative size-full items-center justify-center overflow-hidden border-b bg-black">
        {currentBackground && (
          <img
            className="size-full object-cover"
            src={currentBackground}
            alt={''}
            width={512}
            height={96}
          />
        )}
        <ContainerWrapper className="absolute inset-0 flex items-center justify-center gap-2">
          <Button
            type="button"
            className="z-50 hidden size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-none transition-[color,box-shadow] hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 group-hover:flex"
            onClick={handleThumbnailClick}
            aria-label={
              currentBackground ? 'Alterar imagem' : 'Carregar imagem'
            }
          >
            <ImagePlusIcon size={16} aria-hidden="true" />
          </Button>
          {previewUrl && (
            <Button
              type="button"
              className="z-50 hidden size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-none transition-[color,box-shadow] hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 group-hover:flex"
              onClick={handleImageRemove}
              aria-label="Remover imagem"
            >
              <XIcon size={16} aria-hidden="true" />
            </Button>
          )}
        </ContainerWrapper>
      </ContainerWrapper>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        accept="image/*"
        aria-label="Carregar arquivo de imagem"
      />
    </ContainerWrapper>
  )
}
