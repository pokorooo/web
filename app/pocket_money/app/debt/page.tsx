// app/debt/page.tsx - Debt management
import HeaderActions from '../../components/Header'
export const dynamic = 'force-dynamic'
import { supabaseServer } from '../../lib/supabaseServer'
import { currency } from '../../lib/utils'
import { revalidatePath } from 'next/cache'
import DebtEditModal from '../../components/DebtEditModal'
import { redirect } from 'next/navigation'

async function addDebt(formData: FormData) {
  'use server'
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  let amount = Number(formData.get('amount'))
  if (!Number.isFinite(amount)) return
  amount = Math.max(-10_000_000, Math.min(10_000_000, Math.floor(amount)))
  const memo = String(formData.get('memo') || '')
  const auto = formData.get('auto') === 'on'
  await supabase.from('debt').insert({ user_id: user.id, amount, memo, date: new Date().toISOString(), auto_deduct: auto })
  revalidatePath('/debt')
}

async function updateDebt(formData: FormData) {
  'use server'
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const id = String(formData.get('id') || '')
  if (!id) return
  let amount = Number(formData.get('amount'))
  if (!Number.isFinite(amount)) return
  amount = Math.max(-10_000_000, Math.min(10_000_000, Math.floor(amount)))
  const memo = String(formData.get('memo') || '')
  const auto = formData.get('auto') === 'on'
  await supabase.from('debt').update({ amount, memo, auto_deduct: auto }).eq('id', id).eq('user_id', user.id)
  revalidatePath('/debt')
}

async function deleteDebt(formData: FormData) {
  'use server'
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const id = String(formData.get('id') || '')
  if (!id) return
  await supabase.from('debt').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/debt')
}

export default async function DebtPage() {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: debts } = await supabase.from('debt').select('*').eq('user_id', user?.id).order('date', { ascending: false })
  const balance = (debts ?? []).reduce((acc: number, d: any) => acc + Number(d.amount), 0)

  const normalizeMemo = (m: any): string => {
    const s = String(m || '')
    const mDash = s.match(/^自動控除\(ダッシュボード指定\)\s*(\d{4}-\d{2})$/)
    if (mDash) return `【自動返済】${mDash[1]}のお小遣い`
    const mPlain = s.match(/^自動返済(\d{4}-\d{2})のお小遣い$/)
    if (mPlain) return `【自動返済】${mPlain[1]}のお小遣い`
    return s
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">前借り管理</h1>
        <HeaderActions />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="card">
          <h2 className="mb-2 font-semibold">現在の借金</h2>
          <p className="text-lg font-bold">{currency(balance)}</p>
        </div>
        <form action={addDebt} className="card space-y-3">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="label whitespace-nowrap">金額（借入は+、返済は-）</label>
              <input name="amount" type="number" className="input w-32 text-right" placeholder="1000" required />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
              <label className="label">メモ</label>
              <input name="memo" className="input w-full" placeholder="交通費など" />
            </div>
            <label className="inline-flex items-center gap-2 text-sm mb-1">
              <input name="auto" type="checkbox" defaultChecked /> 自動控除対象
            </label>
            <button className="btn">追加</button>
          </div>
        </form>
      </div>
      <div className="card mt-4">
        <h2 className="mb-2 font-semibold">履歴</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">日付</th>
              <th className="p-2">金額</th>
              <th className="p-2">メモ</th>
              <th className="p-2">自動</th>
              <th className="p-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {(debts ?? []).map((d: any) => (
              <tr key={d.id} className="border-t align-top">
                <td className="p-2 whitespace-nowrap">{new Date(d.date).toLocaleDateString('ja-JP')}</td>
                <td className="p-2">{currency(d.amount)}</td>
                <td className="p-2">{normalizeMemo(d.memo)}</td>
                <td className="p-2">{d.auto_deduct ? '✓' : ''}</td>
                <td className="p-2">
                  <DebtEditModal debt={d} updateAction={updateDebt} deleteAction={deleteDebt} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
