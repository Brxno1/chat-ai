'use client'

import { ArrowRightLeft, CircleUserRoundIcon, ImagePlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useImageUpload } from '@/hooks/use-image-upload'

import React from 'react'
import { truncateText } from '@/utils/truncate-text'
import { CopyTextComponent } from './copy-text-component'
import { Input } from './ui/input'
import { cn } from '@/utils/utils'
import Image from 'next/image'

interface UploadAvatarProps {
  className?: string
  onFileChange?: (name: 'avatar', file: File | FileList | null) => void
  value?: File | null
}

export function UploadAvatar({ className, onFileChange, value }: UploadAvatarProps) {
  const {
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange: handleFileChangeUpload,
    handleRemove,
    fileName,
    file,
  } = useImageUpload()

  React.useEffect(() => {
    onFileChange?.('avatar', file)
  }, [file])

  React.useEffect(() => {
    if (value === null && file !== null) {
      handleRemove()
    }
  }, [value, file, handleRemove])

  const handleFileChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChangeUpload(ev)
    onFileChange?.('avatar', ev.target.files as FileList)
  }

  const handleFileRemove = () => {
    handleRemove()
    onFileChange?.('avatar', null)
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between w-full">
        <div
          className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-input"
          aria-label={
            previewUrl ? 'Preview da imagem carregada' : 'Avatar padrão'
          }
        >
          {previewUrl ? (
            <Image
              className="h-full w-full object-cover"
              src={previewUrl}
              alt="Preview da imagem carregada"
              width={32}
              height={32}
            />
          ) : (
            <div aria-hidden="true">
              <CircleUserRoundIcon className="opacity-60" size={18} />
            </div>
          )}
        </div>
        <div>
          <Button
            onClick={handleThumbnailClick}
            type="button"
            variant="secondary"
            className="w-[10rem]"
          >
            {fileName && (
              <>
                <ArrowRightLeft className="size-4" />
                Alterar foto
              </>
            )}
            {!fileName && (
              <>
                <ImagePlus className="size-4" />
                Selecionar foto
              </>
            )}
          </Button>
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            aria-label="Carregar arquivo de imagem"
          />
        </div>
      </div>
      {fileName && (
        <div className="inline-flex gap-2 text-xs mt-2">
          <div className="flex items-center">
            <CopyTextComponent textForCopy={fileName} className="text-muted-foreground gap-2" iconPosition='left'>
              <p aria-live="polite">
                {truncateText(fileName, 20)}
              </p>
            </CopyTextComponent>
          </div>
          <span className="text-muted-foreground">•</span>
          <button
            onClick={handleFileRemove}
            className="font-medium text-red-500 hover:underline"
            aria-label={`Remover ${fileName}`}
          >
            Remover
          </button>
        </div>
      )}
      <div className="sr-only" aria-live="polite" role="status">
        {previewUrl
          ? 'Imagem carregada e preview disponível'
          : 'Nenhuma imagem carregada'}
      </div>
    </div>
  )
}
