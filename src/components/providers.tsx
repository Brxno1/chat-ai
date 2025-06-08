'use client'

import { AppProgressProvider as ProgressProvider } from '@bprogress/next'
import { QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { Session, User } from 'next-auth'
import React from 'react'
import { Toaster as ToasterSonner } from 'sonner'

import { UserChatProvider } from '@/context/user-provider'
import { createQueryClient } from '@/lib/query-client'

import { ThemeProvider } from './theme/theme-provider'
import { SidebarProvider } from './ui/sidebar'
import { TooltipProvider } from './ui/tooltip'
import { ChatWithMessages } from '@/app/api/chat/actions/get-chats'

interface ProvidersProps {
  children: React.ReactNode
  initialSession: Session | null
  initialUser: User | undefined
  chats: ChatWithMessages[]
  refreshChats: () => Promise<ChatWithMessages[]>
  defaultOpen?: boolean
}

export function Providers({ children, initialSession, initialUser, chats, refreshChats, defaultOpen }: ProvidersProps) {
  const [queryClient] = React.useState(() => createQueryClient())

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <UserChatProvider user={initialUser} session={initialSession} chats={chats} refreshChats={refreshChats}>
        <ProgressProvider
          height=".10rem"
          color="#556eff"
          options={{ showSpinner: false }}
          shallowRouting
        >
          <TooltipProvider>
            <SidebarProvider defaultOpen={defaultOpen}>
              <QueryClientProvider client={queryClient}>
                <NextAuthSessionProvider session={initialSession}>
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
      </UserChatProvider>
    </ThemeProvider>
  )
}