import { NextRequest, NextResponse } from 'next/server'

import { getUrl } from './utils/get-url'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authjs.session-token')
  const { pathname } = request.nextUrl

  if (['/auth'].includes(pathname) && token) {
    return NextResponse.redirect(new URL(getUrl('/dashboard')))
  }

  if (['/dashboard'].includes(pathname) && !token) {
    return NextResponse.redirect(new URL(getUrl('/auth')))
  }

  if (['/api/auth', '/auth'].includes(pathname)) {
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
