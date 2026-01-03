export type ShiftRule = 'none' | 'backward' | 'forward'

function isWeekend(d: Date): boolean {
  const w = d.getDay()
  return w === 0 || w === 6
}

export function computePayDate(year: number, month: number, day: number, rule: ShiftRule): Date {
  // month: 1-12
  const d = new Date(Date.UTC(year, month - 1, Math.min(Math.max(day, 1), 28)))
  if (rule === 'none') return d
  if (!isWeekend(d)) return d
  if (rule === 'backward') {
    while (isWeekend(d)) {
      d.setUTCDate(d.getUTCDate() - 1)
    }
    return d
  }
  // forward
  while (isWeekend(d)) {
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return d
}

export function nextScheduledPayDate(from: Date, day: number, rule: ShiftRule): Date {
  const y = from.getFullYear()
  const m = from.getMonth() + 1
  const candidate = computePayDate(y, m, day, rule)
  if (candidate.getTime() >= new Date(Date.UTC(y, m - 1, from.getDate())).getTime()) return candidate
  // next month
  const ny = m === 12 ? y + 1 : y
  const nm = m === 12 ? 1 : m + 1
  return computePayDate(ny, nm, day, rule)
}

export function ymd(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

