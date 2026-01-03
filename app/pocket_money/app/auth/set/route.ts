// app/auth/set/route.ts - Receive tokens from client and set SSR cookies
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  // Same-origin check to mitigate CSRF on this endpoint
  const origin = request.headers.get('origin') || ''
  const url = new URL(request.url)
  const expectedOrigin = `${url.protocol}//${url.host}`
  const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN || expectedOrigin
  const allowed = new Set([expectedOrigin, siteOrigin])
  if (!origin || !allowed.has(origin)) {
    return NextResponse.json({ ok: false, message: 'Invalid origin' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ ok: false, message: 'Missing Supabase env' }, { status: 500 })
  }

  let body: any = {}
  try {
    body = await request.json()
  } catch {}

  const { access_token, refresh_token } = body || {}
  const res = NextResponse.json({ ok: true })

  const cookieDomain = new URL(siteOrigin).hostname
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name: string) => request.cookies.get(name)?.value,
      set: (name: string, value: string, options: any) =>
        res.cookies.set(name, value, { ...options, domain: cookieDomain }),
      remove: (name: string, options: any) =>
        res.cookies.set(name, '', { ...options, domain: cookieDomain }),
    },
  })

  try {
    if (access_token && refresh_token) {
      await supabase.auth.setSession({ access_token, refresh_token })
    } else if (access_token) {
      // If only access token is provided, attempt to getUser to set minimal cookies
      await supabase.auth.getUser()
    }
  } catch (e: any) {
    // Avoid bubbling up refresh_token reuse errors
    const msg = String(e?.message || '')
    if (!msg.includes('refresh_token_already_used') && !msg.includes('Invalid Refresh Token')) {
      // swallow other transient errors as well
    }
  }

  return res
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
