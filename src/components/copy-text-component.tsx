import { CheckIcon, CopyIcon } from 'lucide-react'
import React from 'react'

import { clipboardWriteText } from '@/utils/clipboard-write-text'
import { cn } from '@/utils/utils'

interface CopyTextComponentProps {
  text: string
  className?: string
  children?: React.ReactNode
  onCloseComponent?: () => void
}

export function CopyTextComponent({
  text,
  className,
  children,
  onCloseComponent,
}: CopyTextComponentProps) {
  const [hasCopied, setHasCopied] = React.useState(false)

  function handleCopy(ev: React.MouseEvent<HTMLDivElement>) {
    ev.preventDefault()

    clipboardWriteText(text)
    setHasCopied(true)
    setTimeout(() => {
      setHasCopied(false)
      onCloseComponent?.()
    }, 800)
  }

  return (
    <div
      onClick={handleCopy}
      className={cn('flex w-full items-center gap-2', className)}
    >
      <div
        className={cn(
          'transition-all',
          hasCopied ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
        )}
      >
        <CheckIcon
          className="stroke-emerald-500"
          size={16}
          aria-hidden="true"
        />
      </div>
      <div
        className={cn(
          'absolute cursor-pointer transition-all',
          hasCopied ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
        )}
      >
        <CopyIcon size={16} aria-hidden="true" />
      </div>
      {children}
    </div>
  )
}
