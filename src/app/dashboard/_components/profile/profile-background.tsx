import { ImagePlusIcon, XIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { ContainerWrapper } from '@/components/container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useImageUpload } from '@/hooks/use-image-upload'

type FileFieldName = 'avatar' | 'background'

interface FileUploadProps {
  Background?: string | null
  onFileChange: ({
    name,
    file,
  }: {
    name: FileFieldName
    file: File | null
  }) => void
}

export function ProfileBackground({
  Background,
  onFileChange,
}: FileUploadProps) {
  const {
    file,
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  } = useImageUpload()

  React.useEffect(() => {
    onFileChange({ name: 'background', file })
  }, [file])

  const currentBackground = previewUrl || Background

  const handleImageRemove = () => {
    handleRemove()
    onFileChange({ name: 'background', file: null })
  }

  const handleFileInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(ev)
    onFileChange({ name: 'background', file: ev.target.files?.[0] || null })
  }

  return (
    <ContainerWrapper className="h-32">
      <ContainerWrapper className="group relative size-full items-center justify-center overflow-hidden border-b">
        {currentBackground ? (
          <Image
            className="size-full object-cover"
            src={currentBackground}
            alt={''}
            width={512}
            height={96}
          />
        ) : (
          <Skeleton className="size-full" />
        )}
        <ContainerWrapper className="absolute inset-0 flex items-center justify-center gap-2">
          <Button
            type="button"
            className="z-50 hidden size-10 cursor-pointer items-center justify-center rounded-full bg-muted text-primary outline-none transition-[color,box-shadow] hover:bg-muted/90 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 group-hover:flex"
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
              className="z-50 hidden size-10 cursor-pointer items-center justify-center rounded-full bg-muted text-primary outline-none transition-[color,box-shadow] hover:bg-muted/90 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 group-hover:flex"
              onClick={handleImageRemove}
              aria-label="Remover imagem"
            >
              <XIcon size={16} aria-hidden="true" />
            </Button>
          )}
        </ContainerWrapper>
      </ContainerWrapper>
      <Input
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
