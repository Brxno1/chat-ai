import { ArrowRightLeft, ImagePlusIcon, XIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { ContainerWrapper } from '@/components/container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useImageUpload } from '@/hooks/use-image-upload'

interface FileUploadProps {
  Background?: string | null
  onFileChange: ({
    name,
    file,
  }: {
    name: 'background'
    file: File | null
  }) => void
}

function BackgroundProfile({ Background, onFileChange }: FileUploadProps) {
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

  const handleRemoveImage = () => {
    handleRemove()
    onFileChange({ name: 'background', file: null })
  }

  const handleFileInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(ev)
    onFileChange({ name: 'background', file: ev.target.files?.[0] || null })
  }

  return (
    <div className="h-32">
      <ContainerWrapper className="group relative size-full items-center justify-center overflow-hidden border-b">
        {currentBackground ? (
          <Image
            src={currentBackground}
            className="size-full object-cover"
            width={512}
            height={96}
            alt="Imagem de fundo"
          />
        ) : (
          <div className="size-full" />
        )}
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
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="h-32">
          <div className="group relative size-full items-center justify-center overflow-hidden border-b">
            <Skeleton className="size-full" />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent align="center">
        <p className="text-xs font-semibold">Carregando imagem de fundo...</p>
      </TooltipContent>
    </Tooltip>
  )
}

export { BackgroundProfile, BackgroundProfileFallback }
