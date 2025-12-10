// lib/supabaseClient.ts - Browser/client Supabase instance
import { createClient } from '@supabase/supabase-js'

export const supabaseBrowser = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase env on client: set NEXT_PUBLIC_* (or SUPABASE_*) in .env.local at app/pocket_money')
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  })
}
