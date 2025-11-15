import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { POSITIONS } from '../types/positions'

function reorder(list, startIndex, endIndex) {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result.map((p, idx) => ({ ...p, order: idx + 1 }))
}

export default function LineupForm({ team, manager, setTeam, setManager, players, setPlayers, bench = [], setBench, pitcher = { name: '' }, setPitcher }) {
  const onDragEnd = (result) => {
    if (!result.destination) return
    if (result.destination.index === result.source.index && result.source.droppableId === result.destination.droppableId) return
    const src = result.source.droppableId
    const dst = result.destination.droppableId
    if (src === 'lineup' && dst === 'lineup') {
      setPlayers(prev => reorder(prev, result.source.index, result.destination.index))
    } else if (src === 'bench' && dst === 'bench') {
      setBench(prev => {
        const arr = Array.from(prev || [])
        const [rem] = arr.splice(result.source.index, 1)
        arr.splice(result.destination.index, 0, rem)
        return arr
      })
    }
  }

  const handleChange = (index, field, value) => {
    setPlayers(prev => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)))
  }

  return (
    <div className="card p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">チーム名</label>
          <input className="input" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="例: 大阪スカイホークス" />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">監督</label>
          <input className="input" value={manager} onChange={(e) => setManager(e.target.value)} placeholder="例: 田中 太郎" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <table className="min-w-full table-fixed border-separate border-spacing-y-2">
            <thead>
              <tr className="text-blue-900">
                <th className="text-left px-2 w-16">打順</th>
                <th className="text-left px-2 w-24 md:w-32">守備位置</th>
                <th className="text-left px-2 w-auto">選手名</th>
              </tr>
            </thead>
            <Droppable droppableId="lineup">
              {(provided) => (
                <tbody ref={provided.innerRef} {...provided.droppableProps}>
                  {players.map((p, index) => (
                    <Draggable key={p.id} draggableId={p.id} index={index}>
                      {(prov, snapshot) => (
                        <tr
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          className={`card ${snapshot.isDragging ? 'ring-2 ring-blue-500' : ''}`}
                        >
                          <td className="px-2 py-3 w-16 align-middle">
                            <div className="flex items-center gap-2">
                              <span {...prov.dragHandleProps} title="ドラッグで並び替え" className="drag-handle text-xl md:text-base p-1 -m-1">≡</span>
                              <span className="font-semibold text-blue-900">{p.order}</span>
                            </div>
                          </td>
                          <td className="px-2 py-2 w-32">
                            <select
                              className="input"
                              value={p.position}
                              onChange={(e) => handleChange(index, 'position', e.target.value)}
                            >
                              <option value="">-</option>
                              {POSITIONS.map(pos => (
                                <option key={pos} value={pos}>{pos}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <input
                              className="input max-w-xs md:max-w-sm"
                              value={p.name}
                              onChange={(e) => handleChange(index, 'name', e.target.value)}
                              placeholder={`選手 ${p.order}`}
                            />
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </table>

          {/* Pitcher */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">投手</h3>
            <div className="card p-3 flex items-center gap-3">
              <div className="text-blue-900 font-medium w-16">投手</div>
              <input
                className="input max-w-xs md:max-w-sm"
                value={pitcher?.name || ''}
                onChange={(e) => setPitcher?.({ name: e.target.value })}
                placeholder="投手名"
              />
              <div className="ml-auto text-sm text-blue-800">守備位置: P</div>
            </div>
          </div>

          {/* Bench editor */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-blue-900">控え</h3>
              {setBench && (
                <button
                  type="button"
                  className="btn btn-secondary !px-3 !py-1 text-sm"
                  onClick={() => setBench((prev = []) => ([...prev, { id: `bench-${Date.now()}`, name: '' }]))}
                >
                  追加
                </button>
              )}
            </div>
            <Droppable droppableId="bench">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                  {(bench || []).map((b, index) => (
                    <Draggable key={b.id} draggableId={b.id} index={index}>
                      {(prov, snapshot) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          className={`card p-2 flex items-center gap-2 ${snapshot.isDragging ? 'ring-2 ring-blue-500' : ''}`}
                        >
                          <span {...prov.dragHandleProps} className="drag-handle text-xl md:text-base p-1 -m-1">≡</span>
                          <input
                            className="input max-w-xs md:max-w-sm"
                            value={b.name || ''}
                            onChange={(e) => setBench(prev => (prev || []).map((x, i) => i === index ? { ...x, name: e.target.value } : x))}
                            placeholder={`控え ${index + 1}`}
                          />
                          <button
                            type="button"
                            className="btn btn-danger !px-2 !py-1 text-sm ml-auto"
                            onClick={() => setBench(prev => (prev || []).filter(x => x.id !== b.id))}
                          >
                            削除
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      </div>
    </div>
  )
}
