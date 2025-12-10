// components/AuthGuard.tsx - Client component to enforce login
"use client"
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = supabaseBrowser()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace('/login')
      else setReady(true)
    })
  }, [])

  if (!ready) return <div className="text-sm text-gray-500">読み込み中...</div>
  return <>{children}</>
}
