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
  title: 'Chat',
  description: 'Chat com IA',
  icons: {
    icon: [
      {
        url: `${process.env.R2_PUBLIC_URL}/favicon-next-app.png?v=2`,
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: `${process.env.R2_PUBLIC_URL}/favicon-next-app.png?v=2`,
        type: 'image/png',
      },
    ],
  },
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
        <Initializer>{children}</Initializer>
      </body>
    </html>
  )
}
