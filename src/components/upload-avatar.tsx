'use client'

import { ArrowRightLeft, CircleUserRoundIcon, ImagePlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useImageUpload } from '@/hooks/use-image-upload'
import { FileChange } from '@/app/dashboard/_components/profile/edit-profile'
import React from 'react'
import { truncateText } from '@/utils/truncate-text'
import { ContainerWrapper } from './container'
import { CopyTextComponent } from './copy-text-component'

interface UploadAvatarProps {
  onFileChange: ({ name, file }: FileChange) => void
}

export function UploadAvatar({ onFileChange }: UploadAvatarProps) {
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
    onFileChange({ name: 'avatar', file })
  }, [file])

  const handleFileChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChangeUpload(ev)
    onFileChange({ name: 'avatar', file: ev.target.files?.[0] ?? null })
  }

  const handleFileRemove = () => {
    handleRemove()
    onFileChange({ name: 'avatar', file: null })
  }

  return (
    <div className="mt-6 flex flex-col gap-2">
      <ContainerWrapper className="flex items-center justify-between">
        <div
          className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-input"
          aria-label={
            previewUrl ? 'Preview da imagem carregada' : 'Avatar padrão'
          }
        >
          {previewUrl ? (
            <img
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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            aria-label="Carregar arquivo de imagem"
          />
        </div>
      </ContainerWrapper>
      {fileName && (
        <div className="inline-flex gap-2 text-xs mt-2">
          <CopyTextComponent textForCopy={fileName} className="text-muted-foreground" />
          {''}
          <p className="truncate text-muted-foreground" aria-live="polite">
            {truncateText({ text: fileName, maxLength: 20 })}
          </p>
          {'-'}
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
