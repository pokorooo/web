// components/Header.tsx - Signed-in header actions
"use client"
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'

export default function HeaderActions() {
  const supabase = supabaseBrowser()
  const router = useRouter()

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }
  return (
    <button onClick={signOut} className="btn-outline text-sm">ログアウト</button>
  )
}

