// app/allowance/page.tsx - Give monthly allowance with auto-deduct
import HeaderActions from '../../components/Header'
export const dynamic = 'force-dynamic'
import { supabaseServer } from '../../lib/supabaseServer'
import { currency, ym } from '../../lib/utils'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function giveAllowance(formData: FormData): Promise<void> {
  'use server'
  let amount = Number(formData.get('amount') || 0)
  if (!Number.isFinite(amount)) amount = 0
  amount = Math.max(0, Math.min(10_000_000, Math.floor(amount)))
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { y, m } = ym()
  // auto-deduct from debts where auto_deduct = true
  const { data: debts } = await supabase.from('debt').select('*').eq('user_id', user.id)
  const auto = (debts ?? []).filter((d: any) => d.auto_deduct)
  const debtBalance = auto.reduce((acc: number, d: any) => acc + Number(d.amount), 0)
  let finalAmount = amount
  if (debtBalance > 0) {
    const repay = Math.min(debtBalance, amount)
    finalAmount = amount - repay
    // add negative record as repayment
    const ymTag = `${y}-${String(m).padStart(2, '0')}`
    await supabase.from('debt').insert({ user_id: user.id, amount: -repay, memo: `自動控除(返済) ${ymTag}` , date: new Date().toISOString(), auto_deduct: true })
  }
  await supabase.from('monthly_allowance').upsert({
    user_id: user.id,
    year: y,
    month: m,
    amount_given: finalAmount,
    given_date: new Date().toISOString(),
    status: 'paid'
  }, { onConflict: 'user_id,year,month' })
  revalidatePath('/allowance')
}

async function updateMonthly(formData: FormData) {
  'use server'
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  let monthly = Number(formData.get('monthly'))
  if (!Number.isFinite(monthly)) monthly = 0
  monthly = Math.max(0, Math.min(1_000_000, Math.floor(monthly)))
  await supabase.from('users').upsert({ id: user.id, monthly_allowance: monthly }, { onConflict: 'id' })
  revalidatePath('/allowance')
  revalidatePath('/dashboard')
}

export default async function AllowancePage() {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { y, m } = ym()
  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
  const { data: allowance } = await supabase.from('monthly_allowance').select('*').eq('user_id', user?.id).eq('year', y).eq('month', m).maybeSingle()
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">お小遣い渡し</h1>
        <HeaderActions />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <form action={updateMonthly} className="card space-y-3">
          <h2 className="font-semibold">月額お小遣いの設定</h2>
          <input name="monthly" type="number" className="input" defaultValue={profile?.monthly_allowance ?? 30000} />
          <button className="btn w-full">保存</button>
        </form>
        <div className="card space-y-2">
          <h2 className="mb-2 font-semibold">今月</h2>
          {allowance ? (
            <>
              <p>支給額: {currency(allowance.amount_given)} / ステータス: <b>{allowance.status}</b></p>
              {allowance.status === 'paid' ? (
                <form action={async () => {
                  'use server'
                  const supabase = supabaseServer()
                  const { data: { user } } = await supabase.auth.getUser()
                  if (!user) return
                  const { y, m } = ym()
                  await supabase.from('monthly_allowance').update({ status: 'unpaid' }).eq('user_id', user.id).eq('year', y).eq('month', m)
                  // remove auto-deduct repayments created for this month
                  const ymTag = `${y}-${String(m).padStart(2, '0')}`
                  await supabase.from('debt').delete().eq('user_id', user.id).eq('auto_deduct', true).lt('amount', 0).in('memo', [`自動控除(返済) ${ymTag}`, `自動控除(ダッシュボード指定) ${ymTag}`])
                  revalidatePath('/allowance')
                }}>
                  <button className="btn btn-secondary">未支給に戻す</button>
                </form>
              ) : null}
            </>
          ) : (
            <p>未支給</p>
          )}
        </div>
        <form action={giveAllowance} className="card space-y-3">
          <label className="label">渡す金額（円）</label>
          <input name="amount" type="number" min={0} className="input" placeholder="30000" defaultValue={30000} required />
          <button className="btn w-full">渡した（自動控除あり）</button>
          <p className="text-xs text-gray-500">auto_deduct=true の前借りがある場合、自動で返済レコードを追加します。</p>
        </form>
      </div>
    </div>
  )
}
