'use client'

import * as React from 'react'

interface PurposefulSuspenseProps {
  fallback: React.ReactNode
  children: React.ReactNode
  delay?: number
  forcedSuspense?: boolean
}

export function PurposefulSuspense({
  children,
  fallback,
  delay = 0,
  forcedSuspense = false,
}: PurposefulSuspenseProps) {
  const [contentReady, setContentReady] = React.useState(false)

  const startTimer = React.useCallback(() => {
    if (!forcedSuspense) {
      const timer = setTimeout(() => setContentReady(true), delay)

      return () => clearTimeout(timer)
    }

    return undefined
  }, [delay, forcedSuspense])

  React.useEffect(() => {
    return startTimer()
  }, [startTimer])

  if (forcedSuspense || !contentReady) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
