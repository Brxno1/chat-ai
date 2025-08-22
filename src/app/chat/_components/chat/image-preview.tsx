import { XIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/animate-ui/radix/dialog'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { useSidebar } from '@/components/animate-ui/radix/sidebar'
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
    <div className="flex max-w-fit flex-row items-center justify-center gap-2 rounded-md p-1.5">
      {previewUrls.map((url, index) => (
        <div
          key={index}
          className="group relative flex max-w-fit flex-row items-center justify-center rounded-md"
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
              <DialogContent
                className="fixed left-[40%] top-[20%] z-50 -translate-x-1/2 -translate-y-1/2 rounded-md [&>button]:hidden"
                from="left"
                transition={{
                  type: 'spring',
                  stiffness: 350,
                  damping: 40,
                }}
              >
                <DialogHeader>
                  <DialogTitle>Preview</DialogTitle>
                </DialogHeader>
                <div className="">
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
              className="absolute -right-1.5 -top-1.5 size-4 rounded-full bg-card p-0.5 text-card-foreground transition-all duration-300 group-hover:flex"
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
