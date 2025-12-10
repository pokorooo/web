// app/page.tsx - Root page (シンプルなランディング / ログインリンク)
import Link from 'next/link'

export default function Home() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-xl font-bold">ログイン</h1>
      <div className="card space-y-4">
        <p className="text-sm text-gray-600">メールリンクでログインできます。サンプル値: test@example.com</p>
        <Link href="/login" className="btn w-full">メールでログイン</Link>
      </div>
    </div>
  )
}
