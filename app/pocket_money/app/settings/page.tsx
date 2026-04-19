// app/settings/page.tsx - Settings page (monthly allowance, public)
import HeaderActions from '../../components/Header'
import PasswordSettingsForm from '../../components/PasswordSettingsForm'
export const dynamic = 'force-dynamic'
import { supabaseServer } from '../../lib/supabaseServer'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

      <div className="grid grid-cols-1 gap-4">
        <PasswordSettingsForm />

        <form action={clearAll} className="card space-y-3">
          <h2 className="font-semibold text-red-700">全データ削除（履歴・設定の初期化）</h2>
          <p className="text-xs text-red-600">注意: あなたの前借り履歴とお小遣い履歴をすべて削除し、設定を初期化します。元に戻せません。</p>
          <label className="label">確認のため「DELETE」と入力</label>
          <input name="confirm" className="input" placeholder="DELETE" />
          <button className="btn w-full bg-red-600 hover:bg-red-700">すべて削除</button>
        </form>
      </div>
    </div>
  )
}
