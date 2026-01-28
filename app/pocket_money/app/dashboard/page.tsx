// app/dashboard/page.tsx - Dashboard for both users
import HeaderActions from '../../components/Header'
import RepaySimulator from '../../components/dashboard/RepaySimulator'
import Link from 'next/link'
import { supabaseServer } from '../../lib/supabaseServer'
import { currency } from '../../lib/utils'
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
  const today = new Date()
  const y = today.getFullYear(); const m = today.getMonth() + 1
  const { data: allowance } = await supabase.from('monthly_allowance').select('*').eq('user_id', user.id).eq('year', y).eq('month', m).maybeSingle()
  // Fetch surrounding years to support multiple display modes
  const { data: rows } = await supabase
    .from('monthly_allowance')
    .select('year,month,status,amount_given')
    .eq('user_id', user.id)
    .in('year', [y - 1, y, y + 1])
  return { user, profile, debtBalance, allowance, rows: rows ?? [], y, m, debts: debts ?? [] }
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
  // Highlight upcoming pay date when 3 days or less
  const toLocal = (d: Date) => new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  const todayLocal = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  const upcomingLocal = toLocal(upcoming)
  const msPerDay = 24 * 60 * 60 * 1000
  const daysUntilUpcoming = Math.ceil((upcomingLocal.getTime() - todayLocal.getTime()) / msPerDay)
  const highlightUpcoming = daysUntilUpcoming >= 0 && daysUntilUpcoming <= 3
  const range = (searchParams?.range === 'rolling' || searchParams?.range === 'half') ? searchParams?.range : 'year'
  // Cards: compute this month metrics
  const monthStart = new Date(data.y, data.m - 1, 1)
  const nextStart = new Date(data.y, data.m, 1)
  const inMonth = (data.debts as any[]).filter((d: any) => {
    const dt = new Date(d.date)
    return dt >= monthStart && dt < nextStart
  })
  const repayThisMonth = inMonth
    .filter((d: any) => Number(d.amount) < 0)
    .reduce((acc: number, d: any) => acc + Math.abs(Number(d.amount)), 0)
  const currentDebt = Math.max(0, data.debtBalance)
  // 返済前の借金額（= 現在 + 今月返済）
  const beforeRepay = Math.max(0, currentDebt + repayThisMonth)
  const baseMonthly = Math.max(0, Number((data.profile as any)?.monthly_allowance ?? 0))
  const takeHome = data.allowance?.status === 'paid'
    ? Math.max(0, Number(data.allowance?.amount_given ?? 0))
    : Math.max(0, baseMonthly - repayThisMonth)
  // 今月お小遣いの内訳（通常分/追加分）
  const baseAfterDeduct = Math.max(0, baseMonthly - repayThisMonth)
  const paidGiven = takeHome
  const usualPart = Math.max(0, Math.min(paidGiven, baseAfterDeduct))
  const extraPart = Math.max(0, paidGiven - usualPart)
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
  async function addTopup(formData: FormData) {
    'use server'
    const supabase = supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const y = Number(formData.get('year'))
    const m = Number(formData.get('month'))
    let top = Number(formData.get('top'))
    if (!Number.isFinite(top)) top = 0
    top = Math.max(0, Math.min(10_000_000, Math.floor(top)))
    if (top <= 0) {
      revalidatePath('/dashboard')
      return
    }
    const { data: existing } = await supabase
      .from('monthly_allowance')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', y)
      .eq('month', m)
      .maybeSingle()
    const current = Math.max(0, Number(existing?.amount_given ?? 0))
    await supabase.from('monthly_allowance').upsert({
      user_id: user.id,
      year: y,
      month: m,
      amount_given: current + top,
      given_date: new Date().toISOString(),
      status: 'paid',
    }, { onConflict: 'user_id,year,month' })
    revalidatePath('/dashboard')
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">ダッシュボード</h1>
        <HeaderActions />
      </div>
      {/* Upcoming banner above cards */}
      {highlightUpcoming ? (
        <div className="mb-3 rounded border border-amber-300 bg-amber-50 text-amber-900 px-3 py-2 text-sm">
          <span className="font-semibold">支給予定日まであと {daysUntilUpcoming} 日</span>
          <span className="ml-2">（次回: {ymd(upcoming)}）</span>
        </div>
      ) : (
        <p className="mb-3 text-sm text-gray-600">今月の予定支給日: <b>{ymd(scheduled)}</b> ／ 次回予定: <b>{ymd(upcoming)}</b></p>
      )}
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="card">
          <div className="text-xs text-slate-600">月額のお小遣い</div>
          <div className="text-2xl font-bold text-blue-900">{currency(baseMonthly)}</div>
          <div className="text-[11px] text-slate-500">設定値</div>
        </div>
        <div className="card">
          <div className="text-xs text-slate-600">現在の借金</div>
          <div className="text-2xl font-bold text-rose-900">{currency(currentDebt)}</div>
          <div className="text-[11px] text-slate-500">残高</div>
          <div className="mt-1 text-[11px] text-slate-600">返済前: {currency(beforeRepay)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-slate-600">今月の返済額</div>
          <div className="text-2xl font-bold text-amber-900">{currency(repayThisMonth)}</div>
          <div className="text-[11px] text-slate-500">目安</div>
        </div>
        <div className="card">
          <div className="text-xs text-slate-600">今月のお小遣い</div>
          <div className="text-2xl font-bold text-emerald-900">{currency(takeHome)}</div>
          <div className="text-[11px] text-slate-500">{data.allowance?.status === 'paid' ? '支給額' : '手取り見込み'}</div>
          <div className="mt-1 text-[11px] text-slate-600">通常: {currency(usualPart)} ／ 追加: {currency(extraPart)}</div>
          <form action={addTopup} className="mt-2 flex items-center gap-1 text-[11px]">
            <input type="hidden" name="year" value={data.y} />
            <input type="hidden" name="month" value={data.m} />
            <input name="top" type="number" min={1} placeholder="例: 5000" className="input !h-8 !py-1 !px-2 w-24 text-[11px]" />
            <button className="btn btn-secondary !h-8 !px-2 text-[11px] whitespace-nowrap">追加</button>
          </form>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">チェック</h2>
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
        <div className="card">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">返済スケジュール</h2>
        </div>
          <RepaySimulator startDebt={currentDebt} monthlyBudget={baseMonthly} />
        </div>
      </div>
    </div>
  )
}
export const dynamic = 'force-dynamic'
export const revalidate = 0
