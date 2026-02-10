// app/allowance/page.tsx - Give monthly allowance with auto-deduct
import HeaderActions from '../../components/Header'
export const dynamic = 'force-dynamic'
import { supabaseServer } from '../../lib/supabaseServer'
import { ym, currency } from '../../lib/utils'
import { computePayDate, nextScheduledPayDate, ymd } from '../../lib/payday'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// 手動入力による支給フォームは削除しました

export default async function AllowancePage() {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { y, m } = ym()
  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
  const meta: any = (user as any)?.user_metadata || {}
  const payDay = Math.max(1, Math.min(28, Number((profile as any)?.pay_day ?? meta?.pay_day ?? 25)))
  const payShift = (['none','backward','forward'].includes((profile as any)?.pay_shift ?? meta?.pay_shift)
    ? ((profile as any)?.pay_shift ?? meta?.pay_shift)
    : 'backward') as any
  const scheduled = computePayDate(y, m, payDay, payShift)
  const upcoming = nextScheduledPayDate(new Date(), payDay, payShift)
  const { data: allowances } = await supabase.from('monthly_allowance')
    .select('*')
    .eq('user_id', user?.id)
    .eq('status', 'paid')
    .order('given_date', { ascending: false })
    .limit(50)
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">お小遣い渡し</h1>
        <HeaderActions />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <form action={async (formData: FormData) => {
          'use server'
          const supabase = supabaseServer()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return
          const day = Math.max(1, Math.min(28, Number(formData.get('pay_day') || 25)))
          const rule = String(formData.get('shift_rule') || 'backward')
          let monthly = Number(formData.get('monthly'))
          if (!Number.isFinite(monthly)) monthly = 0
          monthly = Math.max(0, Math.min(1_000_000, Math.floor(monthly)))
          // Best-effort: store in profile table if columns exist
          try {
            await supabase.from('users').upsert({ id: user.id, pay_day: day, pay_shift: rule, monthly_allowance: monthly }, { onConflict: 'id' })
          } catch {}
          // Always store in Auth user metadata as fallback (no schema change required)
          try {
            await supabase.auth.updateUser({ data: { pay_day: day, pay_shift: rule } as any })
          } catch {}
          revalidatePath('/allowance')
          revalidatePath('/dashboard')
        }} className="card space-y-3">
          <h2 className="font-semibold">お小遣い設定</h2>
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
              <label className="label">支給日（毎月）</label>
              <input name="pay_day" type="number" min={1} max={28} className="input w-full text-right" defaultValue={payDay} />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
              <label className="label">休日のずらし方</label>
              <select name="shift_rule" className="input w-full" defaultValue={payShift}>
                <option value="none">そのまま（ずらさない）</option>
                <option value="backward">前倒し（直前の平日）</option>
                <option value="forward">後ろ倒し（直後の平日）</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="label">月額（円）</label>
              <input name="monthly" type="number" className="input w-full text-right" defaultValue={profile?.monthly_allowance ?? 30000} />
            </div>
            <button className="btn">保存</button>
          </div>
          <p className="text-xs text-gray-500">土日を休日として扱います。今月の予定: <b>{ymd(scheduled)}</b> ／ 次回予定: <b>{ymd(upcoming)}</b></p>
        </form>
        {/* 月額の設定は上のフォームに統合 */}
        <div className="card">
          <h2 className="mb-2 font-semibold">お小遣い支給日</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">支給日</th>
                <th className="p-2">年月</th>
                <th className="p-2">支給額</th>
              </tr>
            </thead>
            <tbody>
              {(allowances ?? []).filter((a: any) => !!a.given_date).map((a: any) => (
                <tr key={`${a.year}-${a.month}-${a.given_date}`} className="border-t">
                  <td className="p-2 whitespace-nowrap">{new Date(a.given_date).toLocaleDateString('ja-JP')}</td>
                  <td className="p-2 whitespace-nowrap">{a.year}年 {a.month}月</td>
                  <td className="p-2">{currency(a.amount_given)}</td>
                </tr>
              ))}
              {(!allowances || allowances.filter((a: any) => !!a.given_date).length === 0) && (
                <tr>
                  <td className="p-2 text-gray-500" colSpan={3}>支給日の履歴がありません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* 今月のカードは非表示にしました */}
        {/* 渡す金額（手動入力）フォームを削除 */}
      </div>
    </div>
  )
}
