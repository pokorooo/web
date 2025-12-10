// app/auth/confirm/page.tsx - Client handler for email magic link
"use client"
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '../../../lib/supabaseClient'

export default function AuthConfirmPage() {
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

      try {
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')

        if (code) {
          // コードはサーバーで交換して Cookie を設定
          location.replace(`/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`)
          return
        }

        // ハッシュフロー (#access_token=... etc) をサポート
        const hash = window.location.hash?.startsWith('#') ? window.location.hash.slice(1) : ''
        const h = new URLSearchParams(hash)
        const at = h.get('access_token')
        const rt = h.get('refresh_token')
        const err = h.get('error')
        const errDesc = h.get('error_description')

        if (err) {
          throw new Error(errDesc || err)
        }

        if (at && rt) {
          const { error } = await supabase.auth.setSession({ access_token: at, refresh_token: rt })
          if (error) throw error
          router.replace(next)
          return
        }

        // どちらの形式でもなければログインページへ
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
          <a className="btn w-full" href="/login">ログイン画面へ戻る</a>
        </div>
      )}
    </div>
  )
}
