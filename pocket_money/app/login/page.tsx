// app/login/page.tsx - Supabase Auth (magic link) sample
"use client"
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useState } from 'react'

export default function LoginPage() {
  const supabase = supabaseBrowser()
  const [email, setEmail] = useState('test@example.com')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/dashboard` } })
    if (error) setError(error.message)
    else setSent(true)
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
    </div>
  )
}

