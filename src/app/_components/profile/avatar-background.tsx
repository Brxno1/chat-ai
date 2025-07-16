import { ArrowRightLeft, ImagePlusIcon, XIcon } from 'lucide-react'
import React from 'react'

import { ContainerWrapper } from '@/components/container'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useSessionUser } from '@/context/user-provider'
import { useImageUpload } from '@/hooks/use-image-upload'

interface FileUploadProps {
  onFileChange: (name: 'background', file: File | null) => void
}

function BackgroundProfile({ onFileChange }: FileUploadProps) {
  const { user } = useSessionUser()

  const {
    file,
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  } = useImageUpload()

  React.useEffect(() => {
    onFileChange('background', file)
  }, [file])

  const currentBackground = previewUrl || user!.background

  const handleRemoveImage = () => {
    handleRemove()
    onFileChange('background', null)
  }

  const handleFileInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(ev)
    onFileChange('background', ev.target.files?.[0] || null)
  }

  return (
    <div className="h-[10rem] lg:h-[12.5rem]">
      <ContainerWrapper className="group relative size-full items-center justify-center overflow-hidden border-b">
        <AspectRatio ratio={16 / 9}>
          <Avatar className="size-full rounded-none">
            <AvatarImage src={currentBackground || ''} />
            <AvatarFallback className="rounded-none">
              <div className="size-full bg-black" />
            </AvatarFallback>
          </Avatar>
        </AspectRatio>
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <Button
            type="button"
            className="z-50 hidden size-10 cursor-pointer items-center justify-center rounded-full bg-muted text-primary outline-none transition-[color,box-shadow] hover:bg-muted/90 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 group-hover:flex"
            onClick={handleThumbnailClick}
            aria-label={currentBackground ? 'Alterar fundo' : 'Carregar fundo'}
          >
            {currentBackground ? (
              <ArrowRightLeft size={16} aria-hidden="true" />
            ) : (
              <ImagePlusIcon size={16} aria-hidden="true" />
            )}
          </Button>
          {previewUrl && (
            <Button
              type="button"
              className="z-50 hidden size-10 cursor-pointer items-center justify-center rounded-full bg-muted text-primary outline-none transition-[color,box-shadow] hover:bg-muted/90 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 group-hover:flex"
              onClick={handleRemoveImage}
              aria-label="Remover fundo"
            >
              <XIcon size={16} aria-hidden="true" />
            </Button>
          )}
        </div>
      </ContainerWrapper>
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        accept="image/*"
        aria-label="Carregar arquivo de imagem"
      />
    </div>
  )
}

function BackgroundProfileFallback() {
  return (
    <div className="size-full">
      <Skeleton className="size-full" />
    </div>
  )
}

export { BackgroundProfile, BackgroundProfileFallback }
