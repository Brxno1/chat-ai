import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

export function NavigationEvents() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => setIsLoading(false)

    window.addEventListener('beforeunload', handleStart)
    window.addEventListener('load', handleComplete)

    return () => {
      window.removeEventListener('beforeunload', handleStart)
      window.removeEventListener('load', handleComplete)
    }
  }, [])

  useEffect(() => {
    setIsLoading(false)
  }, [pathname, searchParams])

  return (
    isLoading && (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
        <Loader2 className="size-10 animate-spin" />
      </div>
    )
  )
}
