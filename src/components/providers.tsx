'use client'

import { AppProgressProvider as ProgressProvider } from '@bprogress/next'
import { QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import React from 'react'
import { Toaster } from 'sonner'

import { queryClient } from '@/lib/query-client'
import { SyncSession } from '@/store/sync-session'

import { ThemeProvider } from './theme/theme-provider'
import { SidebarProvider } from './ui/sidebar'
import { TooltipProvider } from './ui/tooltip'


interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ProgressProvider
        height=".12rem"
        color="#5934ff"
        options={{ showSpinner: false }}
        shallowRouting
      >
        <TooltipProvider>
          <SidebarProvider defaultOpen={false}>
            <QueryClientProvider client={queryClient}>
              <NextAuthSessionProvider>
                <SyncSession />
                {children}
              </NextAuthSessionProvider>
            </QueryClientProvider>
          </SidebarProvider>
        </TooltipProvider>
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
