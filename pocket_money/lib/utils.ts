export function ym(d = new Date()) {
  return { y: d.getFullYear(), m: d.getMonth() + 1 }
}

export function currency(n: number) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(n)
}

