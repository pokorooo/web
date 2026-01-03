// app/login/page.tsx - Supabase Auth (magic link) sample
"use client"
import { supabaseBrowser } from '../../lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('test@example.com')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pwEmail, setPwEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState<string | null>(null)

  // SSR Cookie 同期後のみ /dashboard へ遷移（無限リダイレクト防止）
  useEffect(() => {
    const supabase = supabaseBrowser()
    const base = (process.env.NEXT_PUBLIC_BASE_PATH || '')
    const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || 'https://www.pokoro.tech'
    let cancelled = false

    const syncAndGo = async (access_token?: string, refresh_token?: string) => {
      if (!access_token) return
      try {
        await fetch(`${origin}${base}/auth/set`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token, refresh_token }),
        })
        if (!cancelled) window.location.replace(`${base}/dashboard`)
      } catch {}
    }

    // 既存セッションがあれば自動ログイン（SSR Cookie 同期のうえで遷移）
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session
      if (s) syncAndGo(s.access_token, s.refresh_token ?? undefined)
    })

    // ログイン完了イベントにも反応
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        syncAndGo(session.access_token, session.refresh_token ?? undefined)
      }
    })

    return () => { cancelled = true; sub.subscription.unsubscribe() }
  }, [])

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const supabase = supabaseBrowser()
    // basePath 配下で動く場合に対応
    const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
    const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || 'https://www.pokoro.tech'
    // next は basePath を含めず '/dashboard' 固定にする（二重付与防止）
    const redirectTo = `${origin}${base}/auth/callback?next=${encodeURIComponent('/dashboard')}`
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })
    if (error) setError(error.message)
    else setSent(true)
  }

  const signInWithPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(null)
    try {
      const supabase = supabaseBrowser()
      const { data, error } = await supabase.auth.signInWithPassword({ email: pwEmail, password })
      if (error) return setPwError(error.message)
      // SSR Cookie 同期（ダッシュボードがSSRでユーザー認識できるように）
      const session = data.session
      if (session) {
        const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
        const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || 'https://www.pokoro.tech'
        await fetch(`${origin}${base}/auth/set`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token }),
        }).catch(() => {})
      }
      // basePath 対応のため router を使用
      router.replace('/dashboard')
    } catch (err: any) {
      setPwError(err?.message ?? 'ログインに失敗しました')
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-xl font-bold">メールリンクでログイン</h1>
      <form onSubmit={sendLink} className="card space-y-3">
        <label className="label">メールアドレス</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button className="btn w-full" type="submit">ログインリンクを送信</button>
        {sent && <p className="text-green-600 text-sm">送信しました。メールをご確認ください。</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>

      <div className="my-4 text-center text-sm text-gray-500">または</div>

      <h2 className="mb-2 text-lg font-semibold">メール + パスワードでログイン</h2>
      <form onSubmit={signInWithPassword} className="card space-y-3">
        <label className="label">メールアドレス</label>
        <input className="input" type="email" value={pwEmail} onChange={(e) => setPwEmail(e.target.value)} required />
        <label className="label">パスワード</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn w-full" type="submit">ログイン</button>
        {pwError && <p className="text-red-600 text-sm">{pwError}</p>}
        <p className="text-xs text-gray-500">パスワード未設定の方は、いったん上の「メールリンク」でログイン後、設定ページでパスワードを作成できます。</p>
      </form>
    </div>
  )
}
