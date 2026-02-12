// app/calendar/mark-paid/route.ts - Mark a month as paid
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  const origin = new URL(request.url).origin
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.redirect(new URL(`${base}/calendar`, origin))

  const res = NextResponse.redirect(new URL(`${base}/calendar`, origin))
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
  let amount = Number(form.get('amount'))

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return res

  if (!Number.isFinite(amount) || amount < 0) {
    const { data: profile } = await supabase.from('users').select('monthly_allowance').eq('id', user.id).maybeSingle()
    const baseMonthly = Math.max(0, Number(profile?.monthly_allowance ?? 0))
    const monthStart = new Date(y, m - 1, 1)
    const nextStart = new Date(y, m, 1)
    const { data: debts } = await supabase.from('debt').select('amount,date').eq('user_id', user.id)
    const repayThisMonth = (debts ?? [])
      .filter((d: any) => {
        const dt = new Date(d.date)
        return dt >= monthStart && dt < nextStart && Number(d.amount) < 0
      })
      .reduce((acc: number, d: any) => acc + Math.abs(Number(d.amount)), 0)
    amount = Math.max(0, Math.min(10_000_000, Math.floor(baseMonthly - repayThisMonth)))
  }

  await supabase.from('monthly_allowance').upsert({
    user_id: user.id,
    year: y,
    month: m,
    amount_given: Math.floor(amount),
    given_date: new Date().toISOString(),
    status: 'paid'
  }, { onConflict: 'user_id,year,month' })

  return res
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
