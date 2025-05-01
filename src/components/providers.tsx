'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { AppProgressProvider as ProgressProvider } from '@bprogress/next'
import React from 'react'
import { Toaster } from 'sonner'

import { queryClient } from '@/lib/query-client'
import { UserStoreProvider } from '@/store/user-provider'

import { ThemeProvider } from './theme/theme-provider'
import { SidebarProvider } from './ui/sidebar'
import { TooltipProvider } from './ui/tooltip'
import { Loader2 } from 'lucide-react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [sidebarState, setSidebarState] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedState = window.localStorage.getItem('sidebar_state')
      setSidebarState(storedState === 'true')
    }
  }, [])

  if (sidebarState === null) {
    return (
      <div className="flex h-screen w-screen bg-black items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    )
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ProgressProvider
        height=".25rem"
        color="#5934ff"
        options={{ showSpinner: false }}
        shallowRouting
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
      </ProgressProvider>
    </ThemeProvider>
  )
}
