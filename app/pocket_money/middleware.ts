import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Basic security headers
  const res = NextResponse.next()
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Note: Setting a strict CSP can break Next.js without careful config; omit here.

  return res
}

export const config = {
  matcher: ['/((?!_next/|.*\.(?:js|css|png|jpg|jpeg|gif|svg|ico|map)$).*)'],
}

