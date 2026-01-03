// app/dashboard/page.tsx - Dashboard for both users
import HeaderActions from '../../components/Header'
import Link from 'next/link'
import { supabaseServer } from '../../lib/supabaseServer'
import { currency, ym } from '../../lib/utils'
import { computePayDate, nextScheduledPayDate, ymd } from '../../lib/payday'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function fetchData() {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
  const { data: debts } = await supabase.from('debt').select('*').eq('user_id', user.id)
  const debtBalance = (debts ?? []).reduce((acc: number, d: any) => acc + Number(d.amount), 0)
  const autoBalance = (debts ?? []).filter((d: any) => d.auto_deduct).reduce((acc: number, d: any) => acc + Number(d.amount), 0)
  const today = new Date()
  const y = today.getFullYear(); const m = today.getMonth() + 1
  const { data: allowance } = await supabase.from('monthly_allowance').select('*').eq('user_id', user.id).eq('year', y).eq('month', m).maybeSingle()
  // Fetch surrounding years to support multiple display modes
  const { data: rows } = await supabase
    .from('monthly_allowance')
    .select('year,month,status,amount_given')
    .eq('user_id', user.id)
    .in('year', [y - 1, y, y + 1])
  return { user, profile, debtBalance, autoBalance, allowance, rows: rows ?? [], y, m }
}

export default async function DashboardPage({ searchParams }: { searchParams?: { range?: string } }) {
  const data = await fetchData()
  if (!data) redirect('/login')
  const meta: any = (data.user as any)?.user_metadata || {}
  const payDay = Math.max(1, Math.min(28, Number((data.profile as any)?.pay_day ?? meta?.pay_day ?? 25)))
  const payShift = (['none','backward','forward'].includes((data.profile as any)?.pay_shift ?? meta?.pay_shift)
    ? ((data.profile as any)?.pay_shift ?? meta?.pay_shift)
    : 'backward') as any
  const scheduled = computePayDate(data.y, data.m, payDay, payShift)
  const upcoming = nextScheduledPayDate(new Date(), payDay, payShift)
  const range = (searchParams?.range === 'rolling' || searchParams?.range === 'half') ? searchParams?.range : 'year'
  // Build months to display according to range mode
  const months: Array<{ y: number; m: number }> = []
  if (range === 'year') {
    for (let mm = 1; mm <= 12; mm++) months.push({ y: data.y, m: mm })
  } else if (range === 'rolling') {
    for (let i = 0; i < 12; i++) {
      const mm = ((data.m - 1 + i) % 12) + 1
      const yy = data.y + Math.floor((data.m - 1 + i) / 12)
      months.push({ y: yy, m: mm })
    }
  } else { // 'half' 前後半年ずつ（12ヶ月、当月を含む: 前6ヶ月 + 当月 + 5ヶ月後）
    for (let offset = -6; offset <= 5; offset++) {
      const idx = data.m - 1 + offset
      const mm = ((idx % 12) + 12) % 12 + 1
      const yy = data.y + Math.floor((data.m - 1 + offset) / 12)
      months.push({ y: yy, m: mm })
    }
  }
  async function markPaidQuick(formData: FormData) {
    'use server'
    const supabase = supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const y = Number(formData.get('year'))
    const m = Number(formData.get('month'))
    const raw = Number(formData.get('amount'))
    let amount = Number.isFinite(raw) ? Math.max(0, raw) : NaN
    amount = Math.max(0, Math.min(10_000_000, Math.floor(amount)))
    if (!Number.isFinite(amount)) {
      const { data: profile } = await supabase.from('users').select('monthly_allowance').eq('id', user.id).maybeSingle()
      amount = Math.max(0, Number(profile?.monthly_allowance ?? 0))
    }
    await supabase.from('monthly_allowance').upsert({
      user_id: user.id,
      year: y,
      month: m,
      amount_given: Math.floor(amount),
      given_date: new Date().toISOString(),
      status: 'paid',
    }, { onConflict: 'user_id,year,month' })
    revalidatePath('/dashboard')
  }
  async function markUnpaidQuick(formData: FormData) {
    'use server'
    const supabase = supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const y = Number(formData.get('year'))
    const m = Number(formData.get('month'))
    await supabase.from('monthly_allowance').update({ status: 'unpaid' }).eq('user_id', user.id).eq('year', y).eq('month', m)
    const ymTag = `${y}-${String(m).padStart(2, '0')}`
    await supabase.from('debt').delete().eq('user_id', user.id).eq('auto_deduct', true).lt('amount', 0).in('memo', [`自動控除(返済) ${ymTag}`, `自動控除(ダッシュボード指定) ${ymTag}`])
    revalidatePath('/dashboard')
  }
  async function giveThisMonthWithDeduct(formData: FormData) {
    'use server'
    const supabase = supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { y, m } = ym()
    // ベースは設定の月額
    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
    const base = Math.max(0, Number(profile?.monthly_allowance ?? 0))
    // 借金残高（自動控除対象と全体の両方を見て、0の場合は全体残高を使用）
    const { data: debts } = await supabase.from('debt').select('*').eq('user_id', user.id)
    const auto = (debts ?? []).filter((d: any) => d.auto_deduct)
    const autoBalance = Math.max(0, auto.reduce((acc: number, d: any) => acc + Number(d.amount), 0))
    const allBalance = Math.max(0, (debts ?? []).reduce((acc: number, d: any) => acc + Number(d.amount), 0))
    const sourceBalance = autoBalance > 0 ? autoBalance : allBalance
    const maxRepay = Math.min(sourceBalance, base)
    let desired = Number(formData.get('deduct') ?? 0)
    if (!Number.isFinite(desired)) desired = 0
    desired = Math.max(0, Math.min(10_000_000, Math.floor(desired)))
    const repay = Math.max(0, Math.min(desired, maxRepay))
    const finalAmount = Math.max(base - repay, 0)
    if (repay > 0) {
      const ymTag = `${y}-${String(m).padStart(2, '0')}`
      await supabase.from('debt').insert({ user_id: user.id, amount: -repay, memo: `自動控除(ダッシュボード指定) ${ymTag}`, date: new Date().toISOString(), auto_deduct: true })
    }
    await supabase.from('monthly_allowance').upsert({
      user_id: user.id,
      year: y,
      month: m,
      amount_given: finalAmount,
      given_date: new Date().toISOString(),
      status: 'paid'
    }, { onConflict: 'user_id,year,month' })
    revalidatePath('/dashboard')
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">ダッシュボード</h1>
        <HeaderActions />
      </div>
      <p className="mb-3 text-sm text-gray-600">今月の予定支給日: <b>{ymd(scheduled)}</b> ／ 次回予定: <b>{ymd(upcoming)}</b></p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-2 font-semibold">あなたの設定</h2>
          <p>月額お小遣い: <b>{currency(data.profile?.monthly_allowance ?? 0)}</b></p>
          <p className="mt-1 text-sm text-gray-600">現在の借金: <b>{currency(data.debtBalance)}</b></p>
          <p className="mt-1 text-sm">差引支給額(自動控除後の目安): <b>{currency(Math.max((data.profile?.monthly_allowance ?? 0) - Math.max(data.autoBalance, 0), 0))}</b></p>
        </div>
        <div className="card">
          <h2 className="mb-2 font-semibold">今月のお小遣い</h2>
          {data.allowance && data.allowance.status === 'paid' ? (
            <div className="space-y-2">
              <p>ステータス: <b>{data.allowance.status}</b></p>
              <p>支給額: <b>{currency(data.allowance.amount_given)}</b></p>
              <p className="text-xs text-gray-500">{data.y}/{data.m}</p>
              <form action={async () => {
                'use server'
                const supabase = supabaseServer()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                const { y, m } = ym()
                await supabase.from('monthly_allowance').update({ status: 'unpaid' }).eq('user_id', user.id).eq('year', y).eq('month', m)
                const ymTag = `${y}-${String(m).padStart(2, '0')}`
                await supabase.from('debt').delete().eq('user_id', user.id).eq('auto_deduct', true).lt('amount', 0).in('memo', [`自動控除(返済) ${ymTag}`, `自動控除(ダッシュボード指定) ${ymTag}`])
                revalidatePath('/dashboard')
              }}>
                <button className="btn btn-secondary">未支給に戻す</button>
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              <p>未登録です。今月の支給額と控除額を指定して登録できます。</p>
              <p className="text-sm text-gray-600">月額: <b>{currency(data.profile?.monthly_allowance ?? 0)}</b> ／ 控除対象の借金残高: <b>{currency(Math.max(data.autoBalance, 0) || Math.max(data.debtBalance, 0))}</b></p>
              {(() => {
                const base = Math.max(0, Number(data.profile?.monthly_allowance ?? 0))
                const posAuto = Math.max(data.autoBalance, 0)
                const posAll = Math.max(data.debtBalance, 0)
                const targetBalance = posAuto > 0 ? posAuto : posAll
                const maxDeduct = Math.min(targetBalance, base)
                const defaultRepay = maxDeduct
                const defaultFinal = Math.max(base - defaultRepay, 0)
                return (
                  <form action={giveThisMonthWithDeduct} className="space-y-2">
                    <label className="label">差し引く金額（0〜{currency(maxDeduct)} の範囲内）</label>
                    <input name="deduct" type="number" min={0} max={Math.floor(maxDeduct)} defaultValue={Math.floor(defaultRepay)} className="input" required />
                    <p className="text-xs text-gray-500">送信時に上限内に補正します。初期値の支給額目安: {currency(defaultFinal)}</p>
                    <button className="btn">今月分を支給</button>
                  </form>
                )
              })()}
            </div>
          )}
        </div>
        <div className="card">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">チェック（簡易）</h2>
            <div className="flex gap-1 text-xs">
              <Link className={`btn btn-secondary !px-2 !py-0.5 ${range==='year'?'!bg-blue-100':''}`} href="/dashboard?range=year">今年1年</Link>
              <Link className={`btn btn-secondary !px-2 !py-0.5 ${range==='rolling'?'!bg-blue-100':''}`} href="/dashboard?range=rolling">当月から1年</Link>
              <Link className={`btn btn-secondary !px-2 !py-0.5 ${range==='half'?'!bg-blue-100':''}`} href="/dashboard?range=half">前後半年ずつ</Link>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {months.map(({ y: yy, m: mm }) => {
              const rec = (data.rows as any[]).find((r) => Number(r.year) === yy && Number(r.month) === mm)
              const paid = rec?.status === 'paid'
              const isCurrent = yy === data.y && mm === data.m
              return (
                <div key={`${yy}-${mm}`} className={`p-0.5 rounded border ${paid ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'} ${isCurrent ? 'ring-1 ring-blue-400' : ''}`}>
                  <div className="text-[10px] flex items-center justify-between">
                    <span className="font-medium">{yy}年 {mm}月</span>
                    <span className={`${paid ? 'text-green-700' : 'text-gray-500'}`}>{paid ? '✓' : '-'}</span>
                  </div>
                  {paid ? (
                    <div className="text-[10px] text-gray-700 mt-0.5">{currency(Number(rec?.amount_given ?? 0))}</div>
                  ) : null}
                  <div className="mt-0.5 flex gap-1 items-center">
                    {paid ? (
                      <form action={markUnpaidQuick}>
                        <input type="hidden" name="year" value={yy} />
                        <input type="hidden" name="month" value={mm} />
                        <button className="btn btn-secondary !px-1 !py-0.5 text-[10px]">戻す</button>
                      </form>
                    ) : (
                      <form action={markPaidQuick} className="flex items-center gap-1">
                        <input type="hidden" name="year" value={yy} />
                        <input type="hidden" name="month" value={mm} />
                        <input type="number" name="amount" min={0} defaultValue={Math.floor(Number(data.profile?.monthly_allowance ?? 0))} className="input w-14 !py-0.5 !px-1 text-[10px]" />
                        <button className="btn !px-1 !py-0.5 text-[10px]">✓</button>
                      </form>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
export const dynamic = 'force-dynamic'
export const revalidate = 0
