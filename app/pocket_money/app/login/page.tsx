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

  // もしメールリンクで /login に戻ってきた場合は /auth/confirm に転送
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hasCode = new URLSearchParams(window.location.search).get('code')
    const hash = window.location.hash || ''
    if (hasCode || hash.includes('access_token') || hash.includes('refresh_token')) {
      const q = window.location.search || ''
      const h = window.location.hash || ''
      window.location.replace(`/auth/confirm${q}${h}`)
    }
  }, [])

  // 既にサインイン済みなら /dashboard へ
  useEffect(() => {
    const supabase = supabaseBrowser()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/dashboard')
    })
  }, [])

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const supabase = supabaseBrowser()
    // コードはサーバー側 /auth/callback で交換し Cookie を確実にセット
    const redirectTo = `${location.origin}/auth/callback?next=/dashboard`
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
        await fetch('/auth/set', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token }),
        }).catch(() => {})
      }
      location.href = '/dashboard'
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
