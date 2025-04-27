'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'

import { queryClient } from '@/lib/query-client'
import { UserStoreProvider } from '@/store/user-provider'

import { ThemeProvider } from './theme/theme-provider'
import { SidebarProvider } from './ui/sidebar'
import { TooltipProvider } from './ui/tooltip'

export function Providers({ children }: { children: React.ReactNode }) {
  const [sidebarState, setSidebarState] = useState<boolean | null>(null)

  useEffect(() => {
    const storedState = window.localStorage.getItem('sidebar_state')
    setSidebarState(storedState === 'true')
  }, [])

  if (sidebarState === null) {
    return null
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider defaultOpen={sidebarState}>
        <QueryClientProvider client={queryClient}>
          <NextAuthSessionProvider>
            <TooltipProvider>
              <UserStoreProvider>{children}</UserStoreProvider>
            </TooltipProvider>
          </NextAuthSessionProvider>
        </QueryClientProvider>
      </SidebarProvider>
      <Toaster
        richColors
        duration={3000}
        closeButton
        position="top-right"
        theme="system"
        pauseWhenPageIsHidden
        visibleToasts={2}
      />
    </ThemeProvider>
  )
}
