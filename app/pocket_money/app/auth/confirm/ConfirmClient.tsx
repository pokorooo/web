"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '../../../lib/supabaseClient'

export default function ConfirmClient() {
  const router = useRouter()
  const search = useSearchParams()
  const [message, setMessage] = useState<string>('ログイン処理中...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      let next = search.get('next') || '/dashboard'
      if (typeof next !== 'string' || !next.startsWith('/') || next.startsWith('//')) {
        next = '/dashboard'
      }
      const supabase = supabaseBrowser()
      const base = (process.env.NEXT_PUBLIC_BASE_PATH || '')
      const origin = (process.env.NEXT_PUBLIC_SITE_ORIGIN || 'https://www.pokoro.tech')
      // next に basePath が含まれていたら取り除く（重複防止）
      if (base && next.startsWith(base + '/')) {
        next = next.slice(base.length)
      }

      try {
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')

        if (code) {
          // Always land on the canonical origin to set cookies on the right host
          location.replace(`${origin}${base}/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`)
          return
        }

        const hash = window.location.hash?.startsWith('#') ? window.location.hash.slice(1) : ''
        const h = new URLSearchParams(hash)
        const at = h.get('access_token')
        const rt = h.get('refresh_token')
        const err = h.get('error')
        const errDesc = h.get('error_description')

        if (err) throw new Error(errDesc || err)

        if (at && rt) {
          const { error } = await supabase.auth.setSession({ access_token: at, refresh_token: rt })
          if (error) throw error
          // Sync SSR cookies on canonical origin, then navigate there
          try {
            await fetch(`${origin}${base}/auth/set`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ access_token: at, refresh_token: rt })
            })
          } catch {}
          window.location.replace(`${origin}${base}${next}`)
          return
        }

        setError('メールリンクが無効か、期限切れです。もう一度お試しください。')
      } catch (e: any) {
        setError(e?.message || 'ログイン処理に失敗しました')
      } finally {
        setMessage('')
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-xl font-bold">ログイン確認</h1>
      {message && <p className="text-sm text-gray-600">{message}</p>}
      {error && (
        <div className="card">
          <p className="text-red-600 text-sm mb-2">{error}</p>
          <Link className="btn w-full" href="/login">ログイン画面へ戻る</Link>
        </div>
      )}
    </div>
  )
}
