'use client'

import React from 'react'
import { toast } from 'sonner'

const MAX_IMAGES = 2

export type ImagePreviewItem = {
  url: string
  name?: string
}

interface UseMultipleUploadsProps {
  onUpload?: (url: string | string[]) => void
}

export function useMultipleUploads({ onUpload }: UseMultipleUploadsProps = {}) {
  const previewRef = React.useRef<string | null>(null)
  const previewsRef = React.useRef<string[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [files, setFiles] = React.useState<File[]>([])
  const [images, setImages] = React.useState<ImagePreviewItem[]>([])

  const handleThumbnailClick = React.useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files
      if (!selectedFiles || selectedFiles.length === 0) return

      const newFiles: File[] = Array.from(selectedFiles)
      const newImages: ImagePreviewItem[] = newFiles.map((file) => ({
        url: URL.createObjectURL(file),
        name: file.name,
      }))

      setFiles((prevFiles) => [...newFiles, ...prevFiles])
      setImages((prev) => [...newImages, ...prev])

      const newUrls = newImages.map((img) => img.url)
      previewsRef.current = newUrls
      onUpload?.(newUrls)
    },
    [onUpload],
  )

  const handleRemove = React.useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.url))

    setFiles([])
    setImages([])
    previewsRef.current = []

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [images])

  const handleRemoveItem = React.useCallback(
    (itemIndex: number) => {
      if (itemIndex >= 0 && itemIndex < images.length) {
        URL.revokeObjectURL(images[itemIndex].url)

        setImages((prev) => prev.filter((_, i) => i !== itemIndex))
        setFiles((prev) => prev.filter((_, i) => i !== itemIndex))

        previewsRef.current = previewsRef.current.filter(
          (_, i) => i !== itemIndex,
        )

        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [images],
  )

  const handleRemoveAll = React.useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.url))

    setImages([])
    setFiles([])
    previewsRef.current = []

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [images])

  const validateAndProcessFileInput = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const inputFiles = event.target.files

    if (!inputFiles) return

    const totalImages = images.length + inputFiles.length

    if (totalImages > MAX_IMAGES) {
      toast.warning(`Máximo de ${MAX_IMAGES} imagens permitido`, {
        position: 'top-center',
      })

      const availableSlots = Math.max(0, MAX_IMAGES - images.length)

      const dataTransfer = new DataTransfer()

      for (let i = 0; i < availableSlots; i++) {
        if (i < inputFiles.length) {
          dataTransfer.items.add(inputFiles[i])
        }
      }

      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files
      }

      event.target.files = dataTransfer.files

      if (availableSlots <= 0) return
    }

    handleFileChange(event)
  }

  React.useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current)
      }

      previewsRef.current.forEach((url) => {
        URL.revokeObjectURL(url)
      })
    }
  }, [])

  return {
    files,
    images,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    handleRemoveItem,
    handleRemoveAll,
    validateAndProcessFileInput,
  }
}
