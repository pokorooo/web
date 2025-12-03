// app/dashboard/page.tsx - Dashboard for both users
import AuthGuard from '@/components/AuthGuard'
import HeaderActions from '@/components/Header'
import { supabaseServer } from '@/lib/supabaseServer'
import { currency } from '@/lib/utils'

async function fetchData() {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
  const { data: debts } = await supabase.from('debt').select('*').eq('user_id', user.id)
  const debtBalance = (debts ?? []).reduce((acc: number, d: any) => acc + Number(d.amount), 0)
  const today = new Date()
  const y = today.getFullYear(); const m = today.getMonth() + 1
  const { data: allowance } = await supabase.from('monthly_allowance').select('*').eq('user_id', user.id).eq('year', y).eq('month', m).maybeSingle()
  return { user, profile, debtBalance, allowance, y, m }
}

export default async function DashboardPage() {
  const data = await fetchData()
  return (
    <AuthGuard>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">ダッシュボード</h1>
        <HeaderActions />
      </div>
      {!data ? (
        <p>読み込み中...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card">
            <h2 className="mb-2 font-semibold">あなたの設定</h2>
            <p>月額お小遣い: <b>{currency(data.profile?.monthly_allowance ?? 0)}</b></p>
            <p className="mt-1 text-sm text-gray-600">現在の借金: <b>{currency(data.debtBalance)}</b></p>
          </div>
          <div className="card">
            <h2 className="mb-2 font-semibold">今月のお小遣い</h2>
            {data.allowance ? (
              <div>
                <p>ステータス: <b>{data.allowance.status}</b></p>
                <p>支給額: <b>{currency(data.allowance.amount_given)}</b></p>
                <p className="text-xs text-gray-500">{data.y}/{data.m}</p>
              </div>
            ) : (
              <p>未登録です。「お小遣い」から登録してください。</p>
            )}
          </div>
        </div>
      )}
    </AuthGuard>
  )
}

