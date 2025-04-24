'use client'

import { RocketIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { cn } from '@/utils/utils'

import { ContainerWrapper } from './container'

type LogoProps = {
  className?: string
}

export function Logo({ className }: LogoProps) {
  const router = useRouter()

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <ContainerWrapper
      onClick={handleRefresh}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md bg-zinc-950 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950',
        className,
      )}
    >
      <RocketIcon className="h-5 w-5" />
    </ContainerWrapper>
  )
}
