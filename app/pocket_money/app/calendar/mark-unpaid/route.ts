// app/calendar/mark-unpaid/route.ts - Mark a month as unpaid
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.redirect(new URL('/calendar', request.url))

  const res = NextResponse.redirect(new URL('/calendar', request.url))
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name: string) => request.cookies.get(name)?.value,
      set: (name: string, value: string, options: any) => res.cookies.set(name, value, options),
      remove: (name: string, options: any) => res.cookies.set(name, '', options),
    },
  })

  const form = await request.formData()
  const y = Number(form.get('year'))
  const m = Number(form.get('month'))

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return res

  await supabase.from('monthly_allowance').update({ status: 'unpaid' }).eq('user_id', user.id).eq('year', y).eq('month', m)

  return res
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

