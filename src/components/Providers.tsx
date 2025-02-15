'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'

import { ThemeProvider } from './theme-provider'
import { SidebarProvider } from './ui/sidebar'

export default function Providers({ children }: { children: React.ReactNode }) {
  const sidebarState = window.localStorage.getItem('sidebar_state')

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider defaultOpen={sidebarState === 'true'}>
        <SessionProvider>{children}</SessionProvider>
      </SidebarProvider>
      <Toaster
        richColors
        duration={3000}
        closeButton
        position="top-right"
        theme="system"
      />
    </ThemeProvider>
  )
}
