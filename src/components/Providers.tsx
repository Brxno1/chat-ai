'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'

import { ThemeProvider } from './theme-provider'
import { SidebarProvider } from './ui/sidebar'

export default function Providers({ children }: { children: React.ReactNode }) {
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
