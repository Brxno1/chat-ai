import { XIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ImagePreviewProps {
  previewUrls: string[]
  onRemoveItem: (index: number) => void
}

export function ImagePreview({ previewUrls, onRemoveItem }: ImagePreviewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = React.useState<
    number | null
  >(null)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedImageIndex(null)
    }
  }

  return (
    <div className="flex max-w-fit flex-wrap items-center justify-center rounded-md p-2">
      {previewUrls.map((url, index) => (
        <div
          key={index}
          className="group relative flex max-w-fit flex-wrap items-center justify-center gap-2.5 rounded-md bg-card p-2"
        >
          <Dialog
            open={selectedImageIndex === index}
            onOpenChange={handleOpenChange}
          >
            <div
              data-dialog={selectedImageIndex === index ? 'open' : 'closed'}
              className="fixed inset-0 z-50 backdrop-blur-sm data-[dialog=closed]:hidden"
              aria-hidden="true"
            />
            <DialogTrigger asChild>
              <Avatar
                className="size-14 cursor-pointer rounded-md"
                onClick={() => setSelectedImageIndex(index)}
              >
                <AvatarImage src={url} className="object-cover" />
              </Avatar>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto rounded-md bg-card">
              <DialogHeader className="items-center">
                <DialogTitle>Preview</DialogTitle>
                <DialogClose asChild>
                  <Button
                    variant="link"
                    size="icon"
                    className="absolute right-4 top-2"
                  >
                    <XIcon size={16} />
                  </Button>
                </DialogClose>
              </DialogHeader>
              <div className="flex w-full items-center justify-center">
                <Image
                  src={url}
                  alt="Preview"
                  width={720}
                  height={720}
                  className="max-h-[70vh] rounded-md object-cover"
                />
              </div>
            </DialogContent>
          </Dialog>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 hidden size-4 rounded-full bg-card p-0.5 text-card-foreground transition-all duration-300 group-hover:flex"
            onClick={() => onRemoveItem(index)}
          >
            <XIcon size={14} />
          </Button>
        </div>
      ))}
    </div>
  )
}
