export function ym(d: Date = new Date()): { y: number; m: number } {
  return { y: d.getFullYear(), m: d.getMonth() + 1 }
}

export function currency(n: number): string {
  try {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(Number(n) || 0)
  } catch {
    const v = Math.floor(Number(n) || 0).toString()
    return `¥${v.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
  }
}

