"use client"
import { useState } from 'react'

export default function PasswordSettingsForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)
    setError(null)
    setSaving(true)

    try {
      const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
      const res = await fetch(`${base}/auth/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirm }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) {
        throw new Error(json?.message || 'パスワードを更新できませんでした。')
      }
      setPassword('')
      setConfirm('')
      setMessage(json.message || 'パスワードを更新しました。')
    } catch (err: any) {
      setError(err?.message || 'パスワードを更新できませんでした。')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <h2 className="font-semibold">パスワードの設定/変更</h2>
      <p className="text-xs text-gray-500">設定すると、次回からメール+パスワードで即ログインできます。</p>
      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex flex-col gap-1 flex-1 min-w-[260px]">
          <label className="label whitespace-nowrap">新しいパスワード</label>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="input w-full"
            minLength={8}
            required
            autoComplete="new-password"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[260px]">
          <label className="label whitespace-nowrap">確認</label>
          <input
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            type="password"
            className="input w-full"
            minLength={8}
            required
            autoComplete="new-password"
          />
        </div>
        <button className="btn" disabled={saving}>{saving ? '更新中...' : 'パスワードを更新'}</button>
      </div>
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  )
}
