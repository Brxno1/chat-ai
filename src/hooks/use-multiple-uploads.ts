'use client'

import React from 'react'
import { toast } from 'sonner'

const MAX_IMAGES = 2

interface UseMultipleUploadsProps {
  onUpload?: (url: string | string[]) => void
}

export function useMultipleUploads({ onUpload }: UseMultipleUploadsProps = {}) {
  const previewRef = React.useRef<string | null>(null)
  const previewsRef = React.useRef<string[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [files, setFiles] = React.useState<File[]>([])
  const [fileNames, setFileNames] = React.useState<string[]>([])
  const [fileSizes, setFileSizes] = React.useState<number[]>([])
  const [previewUrls, setPreviewUrls] = React.useState<string[]>([])

  const handleThumbnailClick = React.useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files
      if (!selectedFiles || selectedFiles.length === 0) return

      const newFiles: File[] = Array.from(selectedFiles)

      const newNames: string[] = newFiles.map((file) => file.name)
      const newSizes: number[] = newFiles.map((file) => file.size)
      const newUrls: string[] = newFiles.map((file) =>
        URL.createObjectURL(file),
      )

      setFiles((prevFiles) => [...newFiles, ...prevFiles])
      setFileNames((prevNames) => [...newNames, ...prevNames])
      setFileSizes((prevSizes) => [...newSizes, ...prevSizes])
      setPreviewUrls((prevUrls) => [...newUrls, ...prevUrls])

      previewsRef.current = newUrls
      onUpload?.(newUrls)
    },
    [onUpload, previewUrls],
  )

  const handleRemove = React.useCallback(() => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url))

    setFiles([])
    setFileNames([])
    setFileSizes([])
    setPreviewUrls([])
    previewsRef.current = []

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [previewUrls])

  const handleRemoveItem = React.useCallback(
    (itemIndex: number) => {
      if (itemIndex >= 0 && itemIndex < previewUrls.length) {
        URL.revokeObjectURL(previewUrls[itemIndex])

        setPreviewUrls((prev) => prev.filter((_, i) => i !== itemIndex))
        setFiles((prev) => prev.filter((_, i) => i !== itemIndex))
        setFileNames((prev) => prev.filter((_, i) => i !== itemIndex))
        setFileSizes((prev) => prev.filter((_, i) => i !== itemIndex))

        previewsRef.current = previewsRef.current.filter(
          (_, i) => i !== itemIndex,
        )

        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [previewUrls, fileNames, fileSizes, files],
  )

  const handleRemoveAll = React.useCallback(() => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url))

    setPreviewUrls([])
    setFiles([])
    setFileNames([])
    setFileSizes([])
    previewsRef.current = []

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [previewUrls])

  const validateAndProcessFileInput = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files

    if (!files) return

    const totalImages = previewUrls.length + files.length

    if (totalImages > MAX_IMAGES) {
      toast.warning(`Máximo de ${MAX_IMAGES} imagens permitido`, {
        position: 'top-center',
      })

      const availableSlots = Math.max(0, MAX_IMAGES - previewUrls.length)

      const dataTransfer = new DataTransfer()

      for (let i = 0; i < availableSlots; i++) {
        if (i < files.length) {
          dataTransfer.items.add(files[i])
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
    previewUrls,
    fileNames,
    fileSizes,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    handleRemoveItem,
    handleRemoveAll,
    validateAndProcessFileInput,
  }
}
