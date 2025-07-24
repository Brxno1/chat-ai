import { NextRequest, NextResponse } from 'next/server'

import { getUrl } from './utils/get-url'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authjs.session-token')
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(getUrl('/chat')))
  }

  if (pathname.startsWith('/chat/')) {
    const match = pathname.match(/^\/chat\/([^/?]+)/)
    if (!match) return NextResponse.redirect(new URL(getUrl('/chat')))

    const chatId = match[1]
    const isValidUUID =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(
        chatId,
      )
    const isValidCUID = /^c[a-z0-9]{24}$/i.test(chatId)

    if (!isValidUUID && !isValidCUID) {
      return NextResponse.redirect(new URL(getUrl('/chat')))
    }
  }

  if (pathname === '/auth' && token) {
    return NextResponse.redirect(new URL(getUrl('/chat')))
  }

  if (pathname === '/dashboard' && !token) {
    return NextResponse.redirect(new URL(getUrl('/auth')))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
