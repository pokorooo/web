// components/Header.tsx - Signed-in header actions
"use client"
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '../lib/supabaseClient'

export default function HeaderActions() {
  const router = useRouter()

  const signOut = async () => {
    try {
      const supabase = supabaseBrowser()
      await supabase.auth.signOut()
    } catch {}
    // Clear SSR cookies as well
    const base = (process.env.NEXT_PUBLIC_BASE_PATH || '')
    window.location.href = `${base}/auth/signout`
  }
  return (
    <button onClick={signOut} className="btn-outline text-sm">ログアウト</button>
  )
}
