export default function LineupList({ title = '打順', rows = [], pitcherName = '' }) {
  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">{title}</h3>
      <ol className="divide-y">
        {rows.map((p) => (
          <li key={`row-${p.order}`} className="grid grid-cols-[2rem_1fr_2.5rem] items-center h-9 text-sm">
            <span className="text-blue-900 text-center tabular-nums">{p.order}.</span>
            <span className="text-blue-900 truncate">{p.name || `選手 ${p.order}`}</span>
            <span className="text-blue-700 text-right tabular-nums">{p.position || '-'}</span>
          </li>
        ))}
        <li className="grid grid-cols-[2rem_1fr_2.5rem] items-center h-9 text-sm">
          <span className="text-blue-900 text-center">P</span>
          <span className="text-blue-900 truncate">{pitcherName || '-'}</span>
          <span className="text-blue-700 text-right">P</span>
        </li>
      </ol>
    </div>
  )
}

