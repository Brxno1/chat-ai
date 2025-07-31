'use client'

import { AppProgressProvider as ProgressProvider } from '@bprogress/next'
import { QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { Session, User } from 'next-auth'
import React from 'react'
import { Toaster as ToasterSonner } from 'sonner'

import { UserProvider } from '@/context/user'
import { createQueryClient } from '@/lib/query-client'

import { ThemeProvider } from './theme/theme-provider'
import { SidebarProvider } from './ui/sidebar'
import { TooltipProvider } from './ui/tooltip'
import { ChatWithMessages } from '@/app/api/chat/actions/get-chats'
import { ChatProvider } from '@/context/chat'
import { UserStoreProvider } from '@/store/user/provider'

interface ProvidersProps {
  children: React.ReactNode
  initialSession: Session | null
  initialUser: User | undefined
  initialChats: ChatWithMessages[]
  defaultOpen?: boolean
  model?: string
}

export function Providers({
  children,
  initialSession,
  initialUser,
  initialChats,
  defaultOpen,
  model,
}: ProvidersProps) {
  const [queryClient] = React.useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <UserProvider user={initialUser} session={initialSession}>
          <UserStoreProvider session={initialSession} user={initialUser}>
            <ChatProvider initialChats={initialChats} cookieModel={model}>
              <ProgressProvider
                height=".10rem"
                color="#556eff"
                options={{ showSpinner: false }}
                shallowRouting
              >
                <TooltipProvider>
                  <SidebarProvider defaultOpen={defaultOpen}>
                    <NextAuthSessionProvider session={initialSession}>
                      {children}
                    </NextAuthSessionProvider>
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
            </ChatProvider>
          </UserStoreProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}