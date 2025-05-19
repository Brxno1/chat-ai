import { CheckIcon, CopyIcon } from 'lucide-react'
import React from 'react'

import { clipboardWriteText } from '@/utils/clipboard-write-text'
import { cn } from '@/utils/utils'

function CopyIconComponent({ hasCopied }: { hasCopied: boolean }) {
  return (
    <div className="relative flex items-center">
      <div
        className={cn(
          'transition-all',
          hasCopied ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
        )}
      >
        <CopyIcon size={16} aria-hidden="true" />
      </div>
      <div
        className={cn(
          'absolute right-0 transition-all',
          hasCopied ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
        )}
      >
        <CheckIcon
          className="stroke-emerald-500"
          size={16}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

interface CopyTextComponentProps {
  className?: string
  children?: React.ReactNode
  textForCopy: string
  iconPosition?: 'left' | 'right'
  onCloseComponent?: () => void
}

function CopyTextComponent({
  className,
  children,
  textForCopy,
  iconPosition = 'right',
  onCloseComponent,
}: CopyTextComponentProps) {
  const [hasCopied, setHasCopied] = React.useState(false)

  function handleCopy(ev: React.MouseEvent<HTMLDivElement>) {
    ev.preventDefault()

    clipboardWriteText(textForCopy)
    setHasCopied(true)
    setTimeout(() => {
      setHasCopied(false)
      onCloseComponent?.()
    }, 800)
  }

  return (
    <div
      className={cn('flex w-full items-center', className)}
      onClick={handleCopy}
    >
      {iconPosition === 'left' && <CopyIconComponent hasCopied={hasCopied} />}
      {children}
      {iconPosition === 'right' && <CopyIconComponent hasCopied={hasCopied} />}
    </div>
  )
}

export { CopyTextComponent, CopyIconComponent }
