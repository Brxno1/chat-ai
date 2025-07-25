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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/utils/utils'

interface ImagePreviewProps {
  className?: string
  previewUrls: string[]
  onRemoveItem?: (index: number) => void
  noRemove?: boolean
}

export function ImagePreview({
  className,
  previewUrls,
  onRemoveItem,
  noRemove = false,
}: ImagePreviewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = React.useState<
    number | null
  >(null)
  const { isMobile } = useSidebar()

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedImageIndex(null)
    }
  }

  return (
    <div className="flex max-w-fit flex-row items-center justify-center rounded-md">
      {previewUrls.map((url, index) => (
        <div
          key={index}
          className="group relative flex max-w-fit flex-row items-center justify-center gap-2.5 rounded-md bg-card p-2"
        >
          {isMobile ? (
            <Drawer
              open={selectedImageIndex === index}
              onOpenChange={handleOpenChange}
            >
              <DrawerTrigger asChild>
                <Avatar
                  className={cn(
                    'size-20 cursor-pointer rounded-md object-cover',
                    className,
                  )}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <AvatarImage src={url} className="object-cover" />
                </Avatar>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="sr-only flex items-center justify-between p-4">
                  <DrawerTitle>Preview</DrawerTitle>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon">
                      <XIcon size={16} />
                    </Button>
                  </DrawerClose>
                </DrawerHeader>
                <div className="relative flex h-full items-center justify-center p-4">
                  <Image
                    src={url}
                    alt="Preview"
                    width={320}
                    height={320}
                    className="size-full max-h-[70vh] rounded-md object-cover"
                  />
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
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
                  className={cn(
                    'size-20 cursor-pointer rounded-md object-cover',
                    className,
                  )}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <AvatarImage src={url} className="object-cover" />
                </Avatar>
              </DialogTrigger>
              <DialogContent className="overflow-y-auto rounded-md">
                <DialogHeader className="sr-only">
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
                <div className="relative flex items-center justify-center">
                  <Image
                    src={url}
                    alt="Preview"
                    width={520}
                    height={520}
                    className="size-[30rem] rounded-md object-cover"
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
          {!noRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 hidden size-4 rounded-full bg-card p-0.5 text-card-foreground transition-all duration-300 group-hover:flex"
              onClick={() => onRemoveItem?.(index)}
            >
              <XIcon size={14} />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
