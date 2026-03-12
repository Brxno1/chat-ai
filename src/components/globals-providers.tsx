'use client'

import { AppProgressProvider as ProgressProvider } from '@bprogress/next'
import { QueryClientProvider } from '@tanstack/react-query'
import type { Session, User } from '@/types/auth'
import React from 'react'
import { Toaster as ToasterSonner } from 'sonner'

import { UserProvider } from '@/context/user'
import { createQueryClient } from '@/lib/query-client'

import { ThemeProvider } from './theme/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from './ui/tooltip'
import { ChatProvider } from '@/context/chat'
import { Notification } from '@/types/notifications'
import { Chat } from '@/services/database/generated/client'
import { useChatStore } from '@/store/chat'

interface ProvidersProps {
  children: React.ReactNode
  initialSession: Session | null
  initialUser: User | undefined
  initialChats: Chat[]
  defaultOpen?: boolean
  model?: string
  notifications: Notification[]
}

export function Providers({
  children,
  initialSession,
  initialUser,
  initialChats,
  defaultOpen,
  model,
  notifications,
}: ProvidersProps) {
  const [queryClient] = React.useState(() => createQueryClient())

  const newChatEpoch = useChatStore((state) => state.newChatEpoch)

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <UserProvider
          user={initialUser}
          session={initialSession}
          notifications={notifications}
        >
          <ChatProvider
            key={newChatEpoch}
            initialChats={initialChats}
            cookieModel={model}
          >
            <ProgressProvider
              height=".10rem"
              color="#556eff"
              options={{ showSpinner: false }}
              shallowRouting
            >
              <TooltipProvider>
                <SidebarProvider defaultOpen={defaultOpen}>
                  {children}
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
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
