import './globals.css'

import type { Metadata } from 'next'
import { Geist, Geist_Mono as GeistMono } from 'next/font/google'

import { Initializer } from '@/components/initializer'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = GeistMono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Home',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Initializer>
          <main className="h-screen w-full">{children}</main>
        </Initializer>
      </body>
    </html>
  )
}
