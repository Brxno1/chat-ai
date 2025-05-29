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

  // if (pathname === '/') {
  //   return NextResponse.redirect(new URL(getUrl('/chat')))
  // }

  if (pathname.startsWith('/chat/')) {
    const match = pathname.match(/^\/chat\/([^/?]+)/)
    if (!match) return NextResponse.redirect(new URL(getUrl('/chat')))

    const chatId = match[1]
    const isValidId =
      /^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$/i.test(
        chatId,
      )

    if (!isValidId) {
      return NextResponse.redirect(new URL(getUrl('/chat')))
    }
  }

  if (pathname === '/auth' && token) {
    return NextResponse.redirect(new URL(getUrl('/dashboard')))
  }

  if (pathname === '/dashboard' && !token) {
    return NextResponse.redirect(new URL(getUrl('/auth')))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
