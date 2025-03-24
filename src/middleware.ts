import { NextRequest, NextResponse } from 'next/server'

import { getUrl } from './utils/get-url'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authjs.session-token')
  const { pathname } = request.nextUrl

  if (['/auth', '/login'].includes(pathname) && token) {
    return NextResponse.redirect(new URL(getUrl('/app')))
  }

  if (['/login'].includes(pathname) && !token) {
    return NextResponse.redirect(new URL(getUrl('/auth')))
  }

  if (['/app'].includes(pathname) && !token) {
    return NextResponse.redirect(new URL(getUrl('/')))
  }

  if (['/api/auth', '/auth'].includes(pathname)) {
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
