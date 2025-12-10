// lib/supabaseServer.ts - Supabase for Server Components/Route Handlers
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function supabaseServer() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_URL & SUPABASE_ANON_KEY) in .env.local placed at project root (app/pocket_money)')
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      // In Server Components, mutating cookies is not allowed.
      // Use Route Handlers or Server Actions to set/remove cookies instead.
      set() {},
      remove() {},
    },
  })

  return supabase
}
