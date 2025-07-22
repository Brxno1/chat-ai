'use client'

import React from 'react'

interface UseImageUploadProps {
  onUpload?: (url: string | string[]) => void
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
      const selectedFiles = event.target.files
      if (!selectedFiles || selectedFiles.length === 0) return

      const singleFile = selectedFiles[0]

      setFile(singleFile)
      setFileName(singleFile.name)
      setFileSize(singleFile.size)

      const url = URL.createObjectURL(singleFile)

      setPreviewUrl(url)
      previewRef.current = url
      onUpload?.(url)
    },
    [onUpload, file],
  )

  const handleRemove = React.useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewUrl(null)
    setFileName(null)
    setFileSize(null)
    setFile(null)
    previewRef.current = null

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [previewUrl, file])

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
