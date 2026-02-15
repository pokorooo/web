// app/settings/page.tsx - Settings page (monthly allowance, public)
import HeaderActions from '../../components/Header'
export const dynamic = 'force-dynamic'
import { supabaseServer } from '../../lib/supabaseServer'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function updatePassword(formData: FormData) {
  'use server'
  const pw = String(formData.get('password') || '')
  const confirm = String(formData.get('confirm') || '')
  if (!pw || pw !== confirm) return
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) return
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: '', ...options })
      },
    },
  })
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

      <div className="grid grid-cols-1 gap-4">
        <form action={updatePassword} className="card space-y-3">
          <h2 className="font-semibold">パスワードの設定/変更</h2>
          <p className="text-xs text-gray-500">設定すると、次回からメール+パスワードで即ログインできます。</p>
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex flex-col gap-1 flex-1 min-w-[260px]">
              <label className="label whitespace-nowrap">新しいパスワード</label>
              <input name="password" type="password" className="input w-full" minLength={8} required />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[260px]">
              <label className="label whitespace-nowrap">確認</label>
              <input name="confirm" type="password" className="input w-full" minLength={8} required />
            </div>
            <button className="btn">パスワードを更新</button>
          </div>
        </form>

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
