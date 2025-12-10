"use client"
import { useState } from 'react'

type Debt = { id: string; amount: number; memo?: string | null; auto_deduct?: boolean | null; date?: string }

export default function DebtEditModal({
  debt,
  updateAction,
  deleteAction,
}: {
  debt: Debt
  updateAction: (formData: FormData) => Promise<void>
  deleteAction: (formData: FormData) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="btn !px-2 !py-1 text-xs" onClick={() => setOpen(true)}>編集</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-[90%] max-w-sm rounded-md bg-white p-4 shadow-lg">
            <h3 className="mb-2 text-sm font-semibold">借金を編集</h3>
            <form id={`debt-update-${debt.id}`} action={async (fd) => { await updateAction(fd); setOpen(false) }} className="space-y-2">
              <input type="hidden" name="id" value={debt.id} />
              <label className="label">金額</label>
              <input name="amount" type="number" className="input" defaultValue={debt.amount} required />
              <label className="label">メモ</label>
              <input name="memo" className="input" defaultValue={debt.memo || ''} />
              <label className="inline-flex items-center gap-2 text-sm">
                <input name="auto" type="checkbox" defaultChecked={!!debt.auto_deduct} /> 自動控除対象
              </label>
            </form>
            <div className="flex items-center justify-between gap-2 pt-2">
              <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>閉じる</button>
              <div className="flex gap-2">
                <form action={async (fd) => { await deleteAction(fd); setOpen(false) }}>
                  <input type="hidden" name="id" value={debt.id} />
                  <button className="btn btn-secondary" type="submit">削除</button>
                </form>
                <button className="btn" form={`debt-update-${debt.id}`} type="submit">保存</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
