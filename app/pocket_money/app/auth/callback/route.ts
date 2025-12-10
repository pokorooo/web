// app/auth/callback/route.ts
// Supabase Magic Link / OAuth コールバックで Cookie をセットし、next へリダイレクト
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  let next = url.searchParams.get('next') || '/dashboard'
  // Allow only same-origin relative paths to prevent open redirect
  if (typeof next !== 'string' || !next.startsWith('/') || next.startsWith('//')) {
    next = '/dashboard'
  }
  const res = NextResponse.redirect(new URL(next, url.origin))
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) return res
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name: string) => request.cookies.get(name)?.value,
      set: (name: string, value: string, options: any) => res.cookies.set(name, value, options),
      remove: (name: string, options: any) => res.cookies.set(name, '', options),
    },
  })
  const code = url.searchParams.get('code')
  if (code) {
    try { await supabase.auth.exchangeCodeForSession(code) } catch {}
  }
  return res
}
export const dynamic = 'force-dynamic'
export const revalidate = 0
