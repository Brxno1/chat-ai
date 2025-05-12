import { CheckIcon, CopyIcon } from 'lucide-react'
import React from 'react'

import { clipboardWriteText } from '@/utils/clipboard-write-text'
import { cn } from '@/utils/utils'
import { ContainerWrapper } from './container'

interface CopyTextComponentProps {
  textForCopy: string
  className?: string
  children?: React.ReactNode
  onCloseComponent?: () => void
}

export function CopyTextComponent({
  textForCopy,
  className,
  children,
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
      onClick={handleCopy}
      className={cn('flex items-center', className)}
    >
      {children}
      <ContainerWrapper
        className={cn(
          'cursor-pointer transition-all',
          hasCopied ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
        )}
      >
        <CopyIcon size={16} aria-hidden="true" />
      </ContainerWrapper>
      <ContainerWrapper
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
      </ContainerWrapper>
    </div>
  )
}
