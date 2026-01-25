type Props = {
  monthlyAllowance: number
  debt: number
  thisMonthRepay: number
  takeHome: number
  y: number
  m: number
  addTopup: (formData: FormData) => Promise<void>
}

const currency = (n: number) => Math.floor(n).toLocaleString('ja-JP')

export default function StatCards({ monthlyAllowance, debt, thisMonthRepay, takeHome, y, m, addTopup }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="card">
        <div className="text-xs text-slate-600">月額のお小遣い</div>
        <div className={`text-2xl font-bold text-blue-900`}>{currency(monthlyAllowance)}</div>
        <div className="text-[11px] text-slate-500">設定値</div>
      </div>
      <div className="card">
        <div className="text-xs text-slate-600">現在の借金</div>
        <div className="text-2xl font-bold text-rose-900">{currency(Math.max(0, debt))}</div>
        <div className="text-[11px] text-slate-500">残高</div>
      </div>
      <div className="card">
        <div className="text-xs text-slate-600">今月の返済額</div>
        <div className="text-2xl font-bold text-amber-900">{currency(thisMonthRepay)}</div>
        <div className="text-[11px] text-slate-500">目安</div>
      </div>
      <div className="card">
        <div className="text-xs text-slate-600">今月のお小遣い</div>
        <div className="text-2xl font-bold text-emerald-900">{currency(takeHome)}</div>
        <div className="text-[11px] text-slate-500">手取り見込み</div>
        <form action={addTopup} className="mt-2 flex items-center gap-1 text-[11px]">
          <input type="hidden" name="year" value={y} />
          <input type="hidden" name="month" value={m} />
          <input name="top" type="number" min={1} placeholder="例: 5000" className="input !h-8 !py-1 !px-2 w-24 text-[11px]" />
          <button className="btn btn-secondary !h-8 !px-2 text-[11px] whitespace-nowrap">追加支給</button>
        </form>
      </div>
    </div>
  )
}

