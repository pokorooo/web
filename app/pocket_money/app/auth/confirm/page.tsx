// app/auth/confirm/page.tsx - Wrapper page (Server Component)
import { Suspense } from 'react'
import NextDynamic from 'next/dynamic'
const ConfirmClient = NextDynamic(() => import('./ConfirmClient'), { ssr: false })

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md"><p className="text-sm text-gray-600">ログイン処理中...</p></div>}>
      <ConfirmClient />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'
