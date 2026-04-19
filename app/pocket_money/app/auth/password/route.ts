// app/auth/password/route.ts - Update the current user's password
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin') || ''
  const url = new URL(request.url)
  const expectedOrigin = `${url.protocol}//${url.host}`
  const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN || expectedOrigin
  const allowed = new Set([expectedOrigin, siteOrigin])
  if (!origin || !allowed.has(origin)) {
    return NextResponse.json({ ok: false, message: 'Invalid origin' }, { status: 400 })
  }

  let body: any = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'リクエストを読み取れませんでした。' }, { status: 400 })
  }

  const password = String(body?.password || '')
  const confirm = String(body?.confirm || '')
  if (password.length < 8) {
    return NextResponse.json({ ok: false, message: 'パスワードは8文字以上で入力してください。' }, { status: 400 })
  }
  if (password !== confirm) {
    return NextResponse.json({ ok: false, message: '確認用パスワードが一致しません。' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ ok: false, message: 'Supabase の環境変数が不足しています。' }, { status: 500 })
  }

  const res = NextResponse.json({ ok: true, message: 'パスワードを更新しました。' })
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

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ ok: false, message: 'ログイン状態を確認できませんでした。もう一度ログインしてください。' }, { status: 401 })
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 })
  }

  return res
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
