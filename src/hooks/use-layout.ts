'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

/**
 * Hook to determine if the current page is a chat page
 */
export function useIsChat() {
  const pathname = usePathname()
  return pathname?.startsWith('/chat') || false
}

/**
 * Hook to manage the sidebar positioning
 */
export function useSidebarPosition() {
  const isChat = useIsChat()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [isPositionCalculated, setIsPositionCalculated] = React.useState(false)
  const [sidebarOffset, setSidebarOffset] = React.useState(0)

  React.useEffect(() => {
    // No dashboard, sidebar fica no extremo esquerdo
    if (!isChat) {
      setIsPositionCalculated(true)
      return
    }

    const updateSidebarPosition = () => {
      if (!containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      // Calcula a distância da borda esquerda da viewport até a borda esquerda do container
      const containerLeftOffset = containerRect.left

      setSidebarOffset(containerLeftOffset)
      setIsPositionCalculated(true)
    }

    updateSidebarPosition()
    window.addEventListener('resize', updateSidebarPosition)

    return () => window.removeEventListener('resize', updateSidebarPosition)
  }, [isChat])

  return { containerRef, sidebarOffset, isPositionCalculated }
}

/**
 * Hook to manage the layout style based on the route
 */
export function useLayoutStyle() {
  const isChat = useIsChat()

  const maxWidth = isChat ? '1200px' : '100%'

  return {
    containerClass: isChat ? 'justify-center' : '',
    contentStyle: { maxWidth },
  }
}
