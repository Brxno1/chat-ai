'use client'

import React from 'react'

interface UseImageUploadProps {
  onUpload?: (url: string) => void
}

export function useImageUpload({ onUpload }: UseImageUploadProps = {}) {
  const previewRef = React.useRef<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [file, setFile] = React.useState<File | null>(null)
  const [fileName, setFileName] = React.useState<string | null>(null)
  const [fileSize, setFileSize] = React.useState<number | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

  const handleThumbnailClick = React.useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        setFile(file)
        setFileName(file.name)
        setFileSize(file.size)
        const url = URL.createObjectURL(file)

        setPreviewUrl(url)
        previewRef.current = url
        onUpload?.(url)
      }
    },
    [onUpload],
  )

  const handleRemove = React.useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewUrl(null)
    setFileName(null)
    previewRef.current = null

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [previewUrl])

  React.useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current)
      }
    }
  }, [])

  return {
    file,
    previewUrl,
    fileName,
    fileSize,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  }
}
