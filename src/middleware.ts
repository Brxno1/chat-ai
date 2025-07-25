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

  if (pathname === '/auth' && token) {
    return NextResponse.redirect(new URL(getUrl('/')))
  }

  if (pathname === '/dashboard' && !token) {
    return NextResponse.redirect(new URL(getUrl('/auth')))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
