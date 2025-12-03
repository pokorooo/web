export default function PairedLineups({ leftTitle = '打順', rightTitle = '打順', leftRows = [], rightRows = [], leftPitcher = '', rightPitcher = '' }) {
  return (
    <div className="card p-4 overflow-x-auto">
      <table className="w-full table-fixed text-sm">
        <colgroup>
          <col style={{ width: '2.5rem' }} />
          <col />
          <col style={{ width: '2.25rem' }} />
          <col style={{ width: '1rem' }} />
          <col style={{ width: '2.5rem' }} />
          <col />
          <col style={{ width: '2.25rem' }} />
        </colgroup>
        <thead>
          <tr className="text-blue-900">
            <th className="text-center font-semibold">#</th>
            <th className="text-left font-semibold">{leftTitle}</th>
            <th className="text-right font-semibold">守備</th>
            <th></th>
            <th className="text-center font-semibold">#</th>
            <th className="text-left font-semibold">{rightTitle}</th>
            <th className="text-right font-semibold">守備</th>
          </tr>
        </thead>
        <tbody className="align-middle">
          {leftRows.map((lp, i) => {
            const rp = rightRows[i] || { order: i + 1, name: '', position: '-' }
            return (
              <tr key={`row-${i}`} className="border-t first:border-t-0 border-gray-200 h-9">
                <td className="text-blue-900 text-center tabular-nums">{lp.order}.</td>
                <td className="text-blue-900 truncate">{lp.name || `選手 ${lp.order}`}</td>
                <td className="text-blue-700 text-right tabular-nums">{lp.position || '-'}</td>
                <td></td>
                <td className="text-blue-900 text-center tabular-nums">{rp.order}.</td>
                <td className="text-blue-900 truncate">{rp.name || `選手 ${rp.order}`}</td>
                <td className="text-blue-700 text-right tabular-nums">{rp.position || '-'}</td>
              </tr>
            )
          })}
          <tr className="border-t border-gray-200 h-9">
            <td className="text-blue-900 text-center tabular-nums">P</td>
            <td className="text-blue-900 truncate">{leftPitcher || '-'}</td>
            <td className="text-blue-700 text-right tabular-nums">P</td>
            <td></td>
            <td className="text-blue-900 text-center tabular-nums">P</td>
            <td className="text-blue-900 truncate">{rightPitcher || '-'}</td>
            <td className="text-blue-700 text-right tabular-nums">P</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
