'use client'

import * as React from 'react'

interface PurposefulSuspenseProps {
  fallback: React.ReactNode
  children: React.ReactNode
  delay?: number
  forceShow?: boolean
}

export function PurposefulSuspense({
  children,
  fallback,
  delay = 0,
  forceShow = false,
}: PurposefulSuspenseProps) {
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    if (!forceShow) {
      const timer = setTimeout(() => setShow(true), delay)
      return () => clearTimeout(timer)
    }
  }, [delay, forceShow])

  if (forceShow || !show) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
