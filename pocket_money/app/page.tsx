// app/page.tsx - Root page: redirect or show login links
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabaseServer'
import Link from 'next/link'

export default async function Home() {
  const supabase = supabaseServer()
  const { data } = await supabase.auth.getUser()
  if (data.user) redirect('/dashboard')
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-xl font-bold">ログイン</h1>
      <div className="card space-y-4">
        <p className="text-sm text-gray-600">メールリンクでログインできます。サンプル値: test@example.com</p>
        <form action="/login" className="space-y-3">
          <Link href="/login" className="btn w-full">メールでログイン</Link>
        </form>
      </div>
    </div>
  )
}

