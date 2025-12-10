// app/settings/page.tsx - Settings page (monthly allowance, public)
import HeaderActions from '../../components/Header'
import { supabaseServer } from '../../lib/supabaseServer'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function saveSettings(formData: FormData) {
  'use server'
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  let monthly = Number(formData.get('monthly'))
  if (!Number.isFinite(monthly)) monthly = 0
  monthly = Math.max(0, Math.min(1_000_000, Math.floor(monthly)))
  const publicView = formData.get('public') === 'on'
  // ユーザー行が存在しないケースに備え upsert
  await supabase.from('users').upsert({ id: user.id, monthly_allowance: monthly, public_view: publicView }, { onConflict: 'id' })
  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

async function updatePassword(formData: FormData) {
  'use server'
  const pw = String(formData.get('password') || '')
  const confirm = String(formData.get('confirm') || '')
  if (!pw || pw !== confirm) return
  const supabase = supabaseServer()
  await supabase.auth.updateUser({ password: pw })
  revalidatePath('/settings')
}

async function clearAll(formData: FormData) {
  'use server'
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const confirmText = String(formData.get('confirm') || '')
  if (confirmText !== 'DELETE') return
  // Delete histories
  await supabase.from('monthly_allowance').delete().eq('user_id', user.id)
  await supabase.from('debt').delete().eq('user_id', user.id)
  // Reset settings (keep user row soアプリが動作継続)
  await supabase.from('users').upsert({ id: user.id, monthly_allowance: 30000, public_view: true }, { onConflict: 'id' })
  revalidatePath('/dashboard')
  revalidatePath('/allowance')
  revalidatePath('/debt')
  revalidatePath('/settings')
}

export default async function SettingsPage() {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('users').select('*').eq('id', user?.id).single()
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">設定</h1>
        <HeaderActions />
      </div>

      <form action={saveSettings} className="card max-w-md space-y-3">
        <label className="label">月額お小遣い（円）</label>
        <input name="monthly" type="number" className="input" defaultValue={profile?.monthly_allowance ?? 30000} />
        <label className="inline-flex items-center gap-2 text-sm">
          <input name="public" type="checkbox" defaultChecked={!!profile?.public_view} /> 履歴を相手に公開
        </label>
        <button className="btn w-full">保存</button>
      </form>

      <div className="h-4" />

      <form action={updatePassword} className="card max-w-md space-y-3">
        <h2 className="font-semibold">パスワードの設定/変更</h2>
        <p className="text-xs text-gray-500">設定すると、次回からメール+パスワードで即ログインできます。</p>
        <label className="label">新しいパスワード</label>
        <input name="password" type="password" className="input" minLength={8} required />
        <label className="label">確認</label>
        <input name="confirm" type="password" className="input" minLength={8} required />
        <button className="btn w-full">パスワードを更新</button>
      </form>

      <div className="h-4" />

      <form action={clearAll} className="card max-w-md space-y-3">
        <h2 className="font-semibold text-red-700">全データ削除（履歴・設定の初期化）</h2>
        <p className="text-xs text-red-600">注意: あなたの前借り履歴とお小遣い履歴をすべて削除し、設定を初期化します。元に戻せません。</p>
        <label className="label">確認のため「DELETE」と入力</label>
        <input name="confirm" className="input" placeholder="DELETE" />
        <button className="btn w-full bg-red-600 hover:bg-red-700">すべて削除</button>
      </form>
    </div>
  )
}
