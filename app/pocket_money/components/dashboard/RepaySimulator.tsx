"use client"

import { useRef, useState } from 'react'

type Props = {
  startDebt: number
  monthlyBudget: number
}

const currency = (n: number) => Math.floor(n).toLocaleString('ja-JP')

export default function RepaySimulator({ startDebt, monthlyBudget }: Props) {
  const maxBudget = Math.max(0, Math.floor(monthlyBudget || 0))
  const initial = Math.max(0, Math.floor(startDebt || 0))
  const limit = Math.max(0, maxBudget || initial)
  const [perMonthText, setPerMonthText] = useState(String(Math.min(initial, Math.max(0, maxBudget))))
  const perMonth = Math.max(0, Math.min(Number(perMonthText || 0) || 0, limit))

  // Build schedule up to 24 months or until zero
  const points: number[] = []
  {
    let d = initial
    // Always push the starting point
    points.push(d)
    for (let i = 0; i < 24; i++) {
      if (d <= 0) break
      const cut = Math.max(0, Math.min(perMonth, d))
      d = Math.max(0, d - cut)
      points.push(d)
    }
    if (points.length === 1) points.push(0)
  }
  const monthsToZero = Math.max(0, points.findIndex((v) => v === 0)) || (points[points.length - 1] === 0 ? points.length - 1 : 0)

  // Simple responsive SVG line chart
  const w = 320
  const h = 120
  const pad = 16
  const maxY = Math.max(1, points[0] || 1)
  const path = points.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(1, points.length - 1)
    const y = h - pad - ((v / maxY) * (h - pad * 2))
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  // Hover interaction
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const innerW = w - pad * 2
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
  const getXY = (idx: number) => {
    const x = pad + (idx * innerW) / Math.max(1, points.length - 1)
    const y = h - pad - ((points[idx] / maxY) * (h - pad * 2))
    return { x, y }
  }
  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
    const rel = clamp(e.clientX - rect.left, 0, rect.width)
    const vx = (rel / rect.width) * w
    const iFloat = ((vx - pad) / innerW) * (points.length - 1)
    const idx = Math.round(clamp(iFloat, 0, points.length - 1))
    setHoverIdx(idx)
  }
  const onLeave = () => setHoverIdx(null)

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-xs text-slate-600">毎月の返済額（円）</div>
          <input
            type="number"
            min={0}
            max={limit}
            value={perMonthText}
            onChange={(e) => setPerMonthText(e.target.value)}
            className="input !h-8 !py-1 !px-2 w-32 text-[12px]"
          />
          <div className="text-[11px] text-slate-500 mt-0.5">予算目安: {currency(maxBudget)}／月</div>
        </div>
        <div className="text-right text-[12px] text-slate-600">
          <div>開始残高: ￥{currency(initial)}</div>
          <div>完済まで: {monthsToZero ? `${monthsToZero}ヶ月` : (initial === 0 ? '0ヶ月' : '—')}</div>
        </div>
      </div>
      <div className="rounded border border-slate-200 bg-white">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${w} ${h}`}
          className="w-full h-[140px]"
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        >
          {/* axes */}
          <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#cbd5e1" strokeWidth={1} />
          <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#cbd5e1" strokeWidth={1} />
          {/* x ticks: 0ヶ月 / 最終月（中央は非表示） */}
          {(() => {
            const totalMonths = Math.max(0, points.length - 1)
            const x0 = pad
            const xEnd = w - pad
            const y = h - pad
            return (
              <g>
                <line x1={x0} y1={y} x2={x0} y2={y + 4} stroke="#cbd5e1" strokeWidth={1} />
                <line x1={xEnd} y1={y} x2={xEnd} y2={y + 4} stroke="#cbd5e1" strokeWidth={1} />
                <text x={x0} y={y + 8} fontSize={10} fill="#64748b" textAnchor="start" dominantBaseline="hanging">0ヶ月</text>
                <text x={xEnd} y={y + 8} fontSize={10} fill="#64748b" textAnchor="end" dominantBaseline="hanging">{totalMonths}ヶ月</text>
              </g>
            )
          })()}
          {/* line */}
          <path d={path} fill="none" stroke="#dc2626" strokeWidth={2} />
          {/* ticks */}
          {points.map((v, i) => {
            const x = pad + (i * (w - pad * 2)) / Math.max(1, points.length - 1)
            const y = h - pad - ((v / maxY) * (h - pad * 2))
            return (
              <circle key={i} cx={x} cy={y} r={2} fill="#dc2626" />
            )
          })}
          {hoverIdx !== null ? (() => {
            const { x, y } = getXY(hoverIdx)
            const tipW = 120
            const tipH = 30
            let tx = x + 8
            if (tx + tipW > w - pad) tx = x - 8 - tipW
            let ty = y - tipH - 6
            if (ty < pad) ty = pad
            if (ty + tipH > h - pad) ty = h - pad - tipH
            return (
              <g>
                <line x1={x} y1={pad} x2={x} y2={h - pad} stroke="#94a3b8" strokeDasharray="3,3" />
                <circle cx={x} cy={y} r={3} fill="#dc2626" />
                <rect x={tx} y={ty} width={tipW} height={tipH} rx={4} ry={4} fill="#ffffff" stroke="#94a3b8" />
                <text x={tx + 6} y={ty + 12} fontSize={10} fill="#0f172a">{hoverIdx}ヶ月目</text>
                <text x={tx + 6} y={ty + 24} fontSize={10} fill="#0f172a">残高: ￥{currency(points[hoverIdx])}</text>
              </g>
            )
          })() : null}
        </svg>
      </div>
      <div className="text-[11px] text-slate-500">※ シミュレーション（利息等は考慮しません）</div>
    </div>
  )
}
