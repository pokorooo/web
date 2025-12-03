// app/settings/page.tsx - Settings page (monthly allowance, public)
import AuthGuard from '@/components/AuthGuard'
import HeaderActions from '@/components/Header'
import { supabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

async function saveSettings(formData: FormData) {
  'use server'
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const monthly = Number(formData.get('monthly'))
  const publicView = formData.get('public') === 'on'
  await supabase.from('users').update({ monthly_allowance: monthly, public_view: publicView }).eq('id', user.id)
  revalidatePath('/settings')
}

export default async function SettingsPage() {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('*').eq('id', user?.id).single()
  return (
    <AuthGuard>
      <div className="mb-4 flex items-center justify-between"><h1 className="text-xl font-bold">設定</h1><HeaderActions /></div>
      <form action={saveSettings} className="card max-w-md space-y-3">
        <label className="label">月額お小遣い（円）</label>
        <input name="monthly" type="number" className="input" defaultValue={profile?.monthly_allowance ?? 30000} />
        <label className="inline-flex items-center gap-2 text-sm"><input name="public" type="checkbox" defaultChecked={!!profile?.public_view} /> 履歴を相手に公開</label>
        <button className="btn w-full">保存</button>
      </form>
    </AuthGuard>
  )
}

