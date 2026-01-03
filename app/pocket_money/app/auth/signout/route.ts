// app/auth/signout/route.ts - Clear SSR cookies and sign out
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  const origin = new URL(request.url).origin
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const res = NextResponse.redirect(new URL(`${base}/login`, origin))
  if (!supabaseUrl || !supabaseAnonKey) return res
  const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN || origin
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
  try { await supabase.auth.signOut() } catch {}
  return res
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
