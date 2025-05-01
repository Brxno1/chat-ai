'use client'

import { ArrowUp } from 'lucide-react'
import React from 'react'

import { ContainerWrapper } from '@/components/container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

export function ChatFallback() {
  return (
    <div className="grid h-full w-full max-w-xl grid-rows-[3rem_1fr_auto] flex-col space-y-6 border border-border">
      <header className="sticky top-0 flex h-fit items-center justify-between border-b border-border bg-background p-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="size-8 rounded-sm" />
      </header>

      <ContainerWrapper className="flex flex-col gap-3 overflow-y-auto p-4">
        <div className="mr-auto flex flex-col gap-3">
          <Skeleton className="h-16 w-64" />
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="ml-auto flex flex-col gap-3">
          <Skeleton className="h-20 w-64" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>

        <div className="mr-auto flex flex-col gap-3 overflow-y-auto p-4">
          <Skeleton className="h-28 w-64" />
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="ml-auto flex flex-col gap-3">
          <Skeleton className="h-20 w-64" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      </ContainerWrapper>

      <form className="relative grid w-full grid-cols-[1fr_auto] items-center justify-center gap-4 border-t border-border bg-muted/20 p-4 pt-4">
        <div className="relative">
          <Input disabled className="border-muted-foreground/40" />
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 animate-pulse text-xs text-muted-foreground">
            Digite sua mensagem...
          </span>
        </div>
        <Button
          className="flex items-center justify-center rounded-full border-muted-foreground/40 bg-muted text-muted-foreground"
          type="button"
          variant={'outline'}
          size={'icon'}
          disabled
        >
          <ArrowUp className="size-4" />
        </Button>
      </form>
    </div>
  )
}
