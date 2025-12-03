import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { POSITIONS } from '../types/positions'

function reorder(list, startIndex, endIndex) {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result.map((p, idx) => ({ ...p, order: idx + 1 }))
}

export default function LineupForm({ team, opponent, opponentManager = '', manager, setTeam, setOpponent, setOpponentManager, setManager, players, setPlayers, bench = [], setBench, pitcher = { name: '' }, setPitcher, showOpponent = false, opponentPlayers = [], setOpponentPlayers, opponentPitcher = { name: '' }, setOpponentPitcher, opponentBench = [], setOpponentBench }) {
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

  //
  const onOppDragEnd = (result) => {
    if (!result.destination) return
    if (result.destination.index === result.source.index) return
    const src = result.source.droppableId
    const dst = result.destination.droppableId
    if (src !== dst) return
    if (src === 'opp-lineup') {
      setOpponentPlayers(prev => reorder(prev || [], result.source.index, result.destination.index))
    } else if (src === 'opp-bench') {
      setOpponentBench(prev => {
        const arr = Array.from(prev || [])
        const [rem] = arr.splice(result.source.index, 1)
        arr.splice(result.destination.index, 0, rem)
        return arr
      })
    }
  }

  return (
    <div className="card p-4">
      <div className={`grid ${showOpponent ? 'grid-cols-2 md:[grid-template-columns:5fr_4fr_3fr_3fr]' : 'grid-cols-1 md:[grid-template-columns:8fr_5fr]'} gap-8 md:gap-12 mb-4`}>
        <div className={`min-w-0`}>
          <label className="block text-sm font-medium text-blue-900 mb-1">チーム名</label>
          <input className="input h-11 text-base" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="例: 大阪スカイホークス" />
        </div>
        {showOpponent && (
          <div className="min-w-0">
            <label className="block text-sm font-medium text-blue-900 mb-1">相手チーム</label>
            <input className="input h-11 text-base" value={opponent || ''} onChange={(e) => setOpponent(e.target.value)} placeholder="例: 東京レッドファルコンズ" />
          </div>
        )}
        <div className="min-w-0 md:max-w-[280px]">
          <label className="block text-sm font-medium text-blue-900 mb-1">監督</label>
          <input className="input h-11 text-base" value={manager} onChange={(e) => setManager(e.target.value)} placeholder="例: 田中 太郎" />
        </div>
        {showOpponent && (
          <div className="min-w-0 md:max-w-[260px]">
            <label className="block text-sm font-medium text-blue-900 mb-1">相手監督</label>
            <input className="input h-11 text-base" value={opponentManager || ''} onChange={(e) => setOpponentManager?.(e.target.value)} placeholder="例: 佐藤 一郎" />
          </div>
        )}
      </div>

      {false && showOpponent && <div></div>}

      <div className={showOpponent ? 'grid grid-cols-2 gap-3 items-start' : ''}>
        <div className={`overflow-x-auto`}>
          {showOpponent && (
            <h2 className="text-xl font-bold text-blue-900 mb-2">オーダー</h2>
          )}
          <DragDropContext onDragEnd={onDragEnd}>
          <table className="min-w-full table-fixed border-separate border-spacing-y-2 text-[11px] md:text-sm">
            <thead>
              <tr className="text-blue-900">
                <th className="text-left px-1 md:px-2 w-10 md:w-16">打順</th>
                <th className="text-left px-1 md:px-2 w-14 md:w-24">守備位置</th>
                <th className="text-left px-1 md:px-2 w-auto">選手名</th>
              </tr>
            </thead>
            <Droppable droppableId="lineup">
              {(provided) => (
                <tbody ref={provided.innerRef} {...provided.droppableProps} className="align-middle">
                  {players.map((p, index) => (
                    <Draggable key={p.id} draggableId={p.id} index={index}>
                      {(prov, snapshot) => (
                        <tr
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          className={`card h-10 md:h-14 align-middle ${snapshot.isDragging ? 'ring-2 ring-blue-500' : ''}`}
                        >
                          <td className="px-1 md:px-2 py-3 w-10 md:w-16 align-middle">
                            <div className="flex items-center gap-2">
                              <span {...prov.dragHandleProps} title="ドラッグで並び替え" className="drag-handle text-xl md:text-base p-1 -m-1">≡</span>
                              <span className="font-semibold text-blue-900">{p.order}</span>
                            </div>
                          </td>
                          <td className="px-1 md:px-2 py-2 w-14 md:w-24">
                            <select
                              className="input h-10 text-sm md:h-11 md:text-base"
                              value={p.position}
                              onChange={(e) => handleChange(index, 'position', e.target.value)}
                            >
                              <option value="">-</option>
                              {POSITIONS.map(pos => (
                                <option key={pos} value={pos}>{pos}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-1 md:px-2 py-2">
                            <input
                              className="input max-w-full md:max-w-sm h-10 text-sm md:h-11 md:text-base"
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

          {/* Pitcher (元の位置に戻す) */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">投手</h3>
            <div className="card p-3">
              <input
                className="input w-full md:max-w-sm h-11 text-base"
                value={pitcher?.name || ''}
                onChange={(e) => setPitcher?.({ name: e.target.value })}
                placeholder="投手名"
              />
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
                              className="input max-w-xs md:max-w-sm h-11 text-base"
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

        {showOpponent && (
          <div>
            <h2 className="text-xl font-bold text-blue-900 mb-2">相手オーダー</h2>
            <div className="overflow-x-auto">
              <DragDropContext onDragEnd={onOppDragEnd}>
                <table className="min-w-full table-fixed border-separate border-spacing-y-2 text-[11px] md:text-sm">
                  <thead>
                    <tr className="text-blue-900">
                      <th className="text-left px-1 md:px-2 w-10 md:w-16">打順</th>
                      <th className="text-left px-1 md:px-2 w-14 md:w-24">守備位置</th>
                      <th className="text-left px-1 md:px-2 w-auto">選手名</th>
                    </tr>
                  </thead>
                  <Droppable droppableId="opp-lineup">
                    {(provided) => (
                      <tbody ref={provided.innerRef} {...provided.droppableProps} className="align-middle">
                        {(opponentPlayers || []).map((p, index) => (
                          <Draggable key={p.id || `opp-${index}`} draggableId={p.id || `opp-${index}`} index={index}>
                            {(prov, snapshot) => (
                              <tr
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                className={`card h-10 md:h-14 align-middle ${snapshot.isDragging ? 'ring-2 ring-blue-500' : ''}`}
                              >
                                <td className="px-1 md:px-2 py-3 w-10 md:w-16 align-middle">
                                  <div className="flex items-center gap-2">
                                    <span {...prov.dragHandleProps} title="ドラッグで並び替え" className="drag-handle text-xl md:text-base p-1 -m-1">≡</span>
                                    <span className="font-semibold text-blue-900">{p.order}</span>
                                  </div>
                                </td>
                                <td className="px-1 md:px-2 py-2 w-14 md:w-24">
                                  <select
                                    className="input h-10 text-sm md:h-11 md:text-base"
                                    value={p.position || ''}
                                    onChange={(e) => setOpponentPlayers(prev => (prev || []).map((x, i) => i === index ? { ...x, position: e.target.value } : x))}
                                  >
                                    <option value="">-</option>
                                    {POSITIONS.map(pos => (
                                      <option key={pos} value={pos}>{pos}</option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-1 md:px-2 py-2">
                                  <input
                                    className="input max-w-full md:max-w-sm h-10 text-sm md:h-11 md:text-base"
                                    value={p.name || ''}
                                    onChange={(e) => setOpponentPlayers(prev => (prev || []).map((x, i) => i === index ? { ...x, name: e.target.value } : x))}
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
              </DragDropContext>
            </div>

            {/* Opponent Pitcher */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">相手投手</h3>
              <div className="card p-3">
                <input
                  className="input w-full md:max-w-sm h-11 text-base"
                  value={opponentPitcher?.name || ''}
                  onChange={(e) => setOpponentPitcher?.({ name: e.target.value })}
                  placeholder="投手名"
                />
              </div>
            </div>

            {/* Opponent Bench editor */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-blue-900">相手控え</h3>
                {setOpponentBench && (
                  <button
                    type="button"
                    className="btn btn-secondary !px-3 !py-1 text-sm"
                    onClick={() => setOpponentBench((prev = []) => ([...prev, { id: `opp-bench-${Date.now()}`, name: '' }]))}
                  >
                    追加
                  </button>
                )}
              </div>
              <DragDropContext onDragEnd={onOppDragEnd}>
                <Droppable droppableId="opp-bench">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                      {(opponentBench || []).map((b, index) => (
                        <Draggable key={b.id} draggableId={b.id} index={index}>
                          {(prov, snapshot) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              className={`card p-2 flex items-center gap-2 ${snapshot.isDragging ? 'ring-2 ring-blue-500' : ''}`}
                            >
                              <span {...prov.dragHandleProps} className="drag-handle text-xl md:text-base p-1 -m-1">≡</span>
                              <input
                                className="input max-w-xs md:max-w-sm h-11 text-base"
                                value={b.name || ''}
                                onChange={(e) => setOpponentBench(prev => (prev || []).map((x, i) => i === index ? { ...x, name: e.target.value } : x))}
                                placeholder={`控え ${index + 1}`}
                              />
                              <button
                                type="button"
                                className="btn btn-danger !px-2 !py-1 text-sm ml-auto"
                                onClick={() => setOpponentBench(prev => (prev || []).filter(x => x.id !== b.id))}
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
              </DragDropContext>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
