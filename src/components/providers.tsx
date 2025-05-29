'use client'

import { AppProgressProvider as ProgressProvider } from '@bprogress/next'
import { QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import React from 'react'
import { Toaster as ToasterSonner } from 'sonner'

import { createQueryClient } from '@/lib/query-client'
import { SyncSession } from '@/store/sync-session'

import { ThemeProvider } from './theme/theme-provider'
import { SidebarProvider } from './ui/sidebar'
import { Session } from 'next-auth'
import { TooltipProvider } from './ui/tooltip'

interface ProvidersProps {
  children: React.ReactNode
  initialSession?: Session
  defaultOpen?: boolean
}

export function Providers({ children, initialSession, defaultOpen }: ProvidersProps) {
  const [queryClient] = React.useState(() => createQueryClient())

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ProgressProvider
        height=".10rem"
        color="#6555ff"
        options={{ showSpinner: false }}
        shallowRouting
      >
        <TooltipProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <QueryClientProvider client={queryClient}>
              <NextAuthSessionProvider session={initialSession}>
                <SyncSession initialSession={initialSession!} />
                {children}
              </NextAuthSessionProvider>
            </QueryClientProvider>
          </SidebarProvider>
        </TooltipProvider>
        <ToasterSonner
          richColors
          duration={3000}
          closeButton
          position="top-right"
          theme="dark"
          pauseWhenPageIsHidden
          visibleToasts={2}
        />
      </ProgressProvider>
    </ThemeProvider>
  )
}