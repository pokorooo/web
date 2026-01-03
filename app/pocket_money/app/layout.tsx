// app/layout.tsx - Root layout and Tailwind import
import './globals.css'
import Link from 'next/link'
import AuthHashCatcher from '../components/AuthHashCatcher'
import { ReactNode } from 'react'
import { supabaseServer } from '../lib/supabaseServer'

export const metadata = { title: 'お小遣い管理', description: 'Next.js + Supabase sample' }

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <html lang="ja">
      <body className="min-h-dvh bg-gray-50 text-gray-900">
        <AuthHashCatcher />
        <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-bold text-primary">お小遣い管理</Link>
            <div className="flex items-center gap-3 text-sm">
              <Link href="/dashboard" className="hover:underline">ダッシュボード</Link>
              <Link href="/allowance" className="hover:underline">お小遣い</Link>
              <Link href="/debt" className="hover:underline">前借り</Link>
              <Link href="/settings" className="hover:underline">設定</Link>
              {user?.email ? (
                <span className="ml-2 hidden sm:inline text-gray-600">{user.email}</span>
              ) : null}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
      </body>
    </html>
  )
}
