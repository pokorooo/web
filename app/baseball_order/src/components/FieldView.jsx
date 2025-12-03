import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { POSITIONS, POSITION_COORDS } from '../types/positions'

function findPlayerByPosition(players, position) {
  return players.find(p => p.position === position)
}

export default function FieldView({ team, opponent, opponentManager = '', manager, players, setPlayers, bench = [], setBench, pitcher, showOpponent = false, opponentPlayers = [], opponentPitcher = { name: '' }, readOnly = false }) {
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    const fromPos = source.droppableId
    const toPos = destination.droppableId
    if (fromPos === toPos) return

    const findInPlayers = (id, list) => list.findIndex(p => p.id === id)
    const findPosInPlayers = (pos, list) => list.findIndex(p => p.position === pos)

    setPlayers(prevPlayers => {
      let playersDraft = [...prevPlayers]
      let benchDraft = [...(bench || [])]

      // locate moving entity
      let movingType = 'players'
      let movingIdx = findInPlayers(draggableId, playersDraft)
      if (movingIdx === -1) {
        movingType = 'bench'
        movingIdx = benchDraft.findIndex(p => p.id === draggableId)
        if (movingIdx === -1) return prevPlayers
      }

      const setEntity = (type, idx, patch) => {
        if (type === 'players') playersDraft[idx] = { ...playersDraft[idx], ...patch }
        else benchDraft[idx] = { ...benchDraft[idx], ...patch }
      }

      const getEntity = (type, idx) => (type === 'players' ? playersDraft[idx] : benchDraft[idx])

      // destination handling
      if (toPos === 'NONE') {
        // Move to bench area => clear position
        setEntity(movingType, movingIdx, { position: '' })
      } else {
        // Move to a position; if occupied, swap
        let targetType = 'players'
        let targetIdx = findPosInPlayers(toPos, playersDraft)
        if (targetIdx === -1) {
          targetType = 'bench'
          targetIdx = benchDraft.findIndex(p => p.position === toPos)
        }

        if (targetIdx !== -1) {
          const fromPosValue = getEntity(movingType, movingIdx).position || ''
          const toPosValue = toPos
          // swap positions
          setEntity(targetType, targetIdx, { position: fromPosValue })
          setEntity(movingType, movingIdx, { position: toPosValue })
        } else {
          setEntity(movingType, movingIdx, { position: toPos })
        }
      }

      // persist bench changes
      if (setBench) setBench(benchDraft)
      return playersDraft
    })
  }

  const benchLineup = players.filter(p => !p.position)
  const benchExtras = (bench || []).filter(b => !b.position)
  const benchPlayers = [...benchExtras, ...benchLineup]

  const normalize = (arr = []) => {
    const byOrder = new Map(arr.map(p => [p.order, p]))
    return Array.from({ length: 9 }, (_, i) => {
      const o = i + 1
      const p = byOrder.get(o) || {}
      return { order: o, name: p.name || '', position: p.position || '-' }
    })
  }
  const selfRows = normalize(players)
  const oppRows = normalize(opponentPlayers || [])

  return (
    <div className={`grid gap-4 md:grid-cols-3`}>
      {/* Left sidebar: compact lineup */}
      <div className="card p-3 hidden md:flex md:flex-col h-full overflow-auto">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">打順</h3>
        <ol className="divide-y">
          {players.map(p => (
            <li key={p.id} className="grid grid-cols-[1.5rem_1fr_2rem] items-center h-7 text-xs">
              <span className="text-blue-900 text-center tabular-nums">{p.order}.</span>
              <span className="text-blue-900 truncate">{p.name || `選手 ${p.order}`}</span>
              <span className="text-blue-700 text-right tabular-nums">{p.position || '-'}</span>
            </li>
          ))}
          <li className="grid grid-cols-[1.5rem_1fr_2rem] items-center h-7 text-xs">
            <span className="text-blue-900 text-center">P</span>
            <span className="text-blue-900 truncate">{pitcher?.name || '-'}</span>
            <span className="text-blue-700 text-right tabular-nums">P</span>
          </li>
        </ol>
      </div>

      {/* Right area: header + field (+ bench when editable) */}
      <div className="md:col-span-2 flex flex-col gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-blue-900 flex flex-wrap items-baseline gap-x-2">
                <span>{team || 'チーム名未設定'}</span>
              </h2>
              <p className="text-sm text-blue-800">監督: {manager || '-'}</p>
            </div>
          </div>
          <DragDropContext onDragEnd={readOnly ? () => {} : onDragEnd}>
          <div className="relative w-full aspect-square rounded-xl overflow-hidden border-4 border-red-400 bg-green-200 touch-none select-none">
            {/* SVG Field Illustration (MLB style) */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" shapeRendering="crispEdges">
              <defs>
                <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#67c46a" />
                  <stop offset="100%" stopColor="#2f8a4d" />
                </linearGradient>
                <pattern id="mow" width="8" height="8" patternUnits="userSpaceOnUse">
                  <rect width="8" height="4" fill="rgba(255,255,255,0.05)" />
                  <rect y="4" width="8" height="4" fill="rgba(0,0,0,0.035)" />
                </pattern>
                
              </defs>

              {/* Grass + mowing pattern */}
              <rect x="0" y="0" width="100" height="100" fill="url(#grass)" />
              <rect x="0" y="0" width="100" height="100" fill="url(#mow)" />

              {/* Outfield fence as curved Bezier within bounds (center pushed further back) */}
              <path d="M0,30 Q50,8 100,30" fill="none" stroke="#0f5132" strokeWidth="3.5" />

              {/* Foul poles aligned to foul lines */}
              <line x1="0" y1="30" x2="0" y2="8" stroke="#facc15" strokeWidth="1.3" />
              <line x1="100" y1="30" x2="100" y2="8" stroke="#facc15" strokeWidth="1.3" />

              {/* Infield dirt diamond (shifted toward home) */}
              <polygon points="50,42 65,58 50,74 35,58" fill="#d9b48f" stroke="#c79c77" strokeWidth="1" />

              {/* Base lines (chalk) reverted */}
              <line x1="50" y1="80" x2="80" y2="50" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="square" vectorEffect="non-scaling-stroke" />
              <line x1="50" y1="80" x2="20" y2="50" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="square" vectorEffect="non-scaling-stroke" />

              {/* Foul lines to poles (straight) reverted from 1B/3B */}
              <line x1="20" y1="50" x2="0" y2="30" stroke="#ffffff" strokeWidth="0.9" opacity="0.95" strokeLinecap="square" vectorEffect="non-scaling-stroke" />
              <line x1="80" y1="50" x2="100" y2="30" stroke="#ffffff" strokeWidth="0.9" opacity="0.95" strokeLinecap="square" vectorEffect="non-scaling-stroke" />

              {/* Bases aligned along chalk lines (1B/3B on lines) */}
              <rect x="0" y="0" width="4" height="4" fill="#fff" stroke="#ccc" strokeWidth="0.5" transform="translate(65,58) rotate(45 2 2)" />
              <rect x="0" y="0" width="4" height="4" fill="#fff" stroke="#ccc" strokeWidth="0.5" transform="translate(48,38) rotate(45 2 2)" />
              <rect x="0" y="0" width="4" height="4" fill="#fff" stroke="#ccc" strokeWidth="0.5" transform="translate(30,58) rotate(45 2 2)" />
              {/* Home plate (vertical sides) */}
              <path d="M47,78 L53,78 L53,80.5 L50,84 L47,80.5 Z" fill="#fff" stroke="#ccc" strokeWidth="0.6" />

              {/* Batter's boxes (vertical) */}
              <rect x="43.0" y="73.0" width="3.2" height="8.0" fill="#ffffffb0" stroke="#ffffff" strokeWidth="0.4" />
              <rect x="53.8" y="73.0" width="3.2" height="8.0" fill="#ffffffb0" stroke="#ffffff" strokeWidth="0.4" />

              {/* Pitcher's mound + rubber */}
              <circle cx="50" cy="56" r="3.2" fill="#e6c89d" stroke="#c79c77" strokeWidth="0.7" />
              <rect x="48.8" y="55.2" width="2.4" height="0.9" fill="#fff" opacity="0.9" />

              {/* On-deck circles */}
              <circle cx="28" cy="74" r="2.2" fill="#ffffff99" stroke="#ffffff" strokeWidth="0.5" />
              <circle cx="72" cy="74" r="2.2" fill="#ffffff99" stroke="#ffffff" strokeWidth="0.5" />
            </svg>

            {/* Positions */}
            {POSITIONS.filter(pos => pos !== 'DH').map((pos) => {
              const coord = POSITION_COORDS[pos]
              const player = findPlayerByPosition(players, pos)
              return (
                <Droppable key={pos} droppableId={pos}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`absolute -translate-x-1/2 -translate-y-1/2`}
                      style={{ left: `${coord.left}%`, top: `${coord.top}%` }}
                    >
                      <div className={`w-16 md:w-20 text-center ${snapshot.isDraggingOver ? 'ring-2 ring-blue-500' : ''}`}>
                        <div className="text-[10px] md:text-xs text-blue-900 mb-0.5">{pos}</div>
                        {player ? (
                          <Draggable draggableId={player.id} index={0}>
                            {(prov, dragSnapshot) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                className={`px-1.5 py-0.5 rounded bg-white border border-blue-700 text-blue-900 shadow text-xs md:text-sm leading-tight ${dragSnapshot.isDragging ? 'ring-2 ring-blue-500' : ''}`}
                                style={{ touchAction: 'none' }}
                                title={player.name || `選手 ${player.order}`}
                              >
                                <span className="block truncate">{player.name || `選手 ${player.order}`}</span>
                              </div>
                            )}
                          </Draggable>
                        ) : (
                          pos === 'P' && pitcher?.name ? (
                            <div className="px-1.5 py-0.5 rounded bg-white border border-blue-700 text-blue-900 shadow text-xs md:text-sm leading-tight" title={`投手: ${pitcher.name}`}>
                              <span className="block truncate">{pitcher.name}</span>
                            </div>
                          ) : (
                            <div className="px-1.5 py-0.5 rounded bg-white/60 border border-dashed border-blue-400 text-blue-700 text-xs">空き</div>
                          )
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              )
            })}

            {/* DH position displayed bottom-right */}
            <Droppable droppableId="DH">
              {(provided, snapshot) => {
                const player = findPlayerByPosition(players, 'DH')
                const coord = POSITION_COORDS['DH']
                return (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${coord.left}%`, top: `${coord.top}%` }}
                  >
                    <div className={`w-16 md:w-20 text-center ${snapshot.isDraggingOver ? 'ring-2 ring-blue-500' : ''}`}>
                      <div className="text-xs text-blue-900 mb-1">DH</div>
                      {player ? (
                        <Draggable draggableId={player.id} index={0}>
                          {(prov, dragSnapshot) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              className={`px-1.5 py-0.5 rounded bg-white border border-blue-700 text-blue-900 shadow text-xs md:text-sm leading-tight ${dragSnapshot.isDragging ? 'ring-2 ring-blue-500' : ''}`}
                              title={player.name || `選手 ${player.order}`}
                            >
                              <span className="block truncate">{player.name || `選手 ${player.order}`}</span>
                            </div>
                          )}
                        </Draggable>
                      ) : (
                        <div className="px-1.5 py-0.5 rounded bg-white/60 border border-dashed border-blue-400 text-blue-700 text-xs">空き</div>
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )
              }}
            </Droppable>

          </div>
          {/* Bench droppable outside the field */}
          {!readOnly && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-blue-900">ベンチ（控え＋未配置）</div>
              {setBench && (
                <button
                  type="button"
                  className="btn btn-secondary !px-2 !py-1 text-xs"
                  onClick={() => setBench((prev = []) => ([...prev, { id: `bench-${Date.now()}`, name: '', position: '' }]))}
                >
                  控え追加
                </button>
              )}
            </div>
            <Droppable droppableId="NONE" direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-2 bg-white/80 rounded-md border ${snapshot.isDraggingOver ? 'ring-2 ring-blue-500' : 'border-blue-300'} flex flex-wrap gap-2`}
                >
                  {benchPlayers.map((p, i) => (
                          <Draggable key={p.id} draggableId={p.id} index={i}>
                            {(prov, dragSnapshot) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                className={`px-1.5 py-0.5 rounded bg-white border border-blue-700 text-blue-900 shadow text-xs leading-tight flex items-center gap-1 ${dragSnapshot.isDragging ? 'ring-2 ring-blue-500' : ''}`}
                                style={{ touchAction: 'none' }}
                                title={p.name || (p.order ? `選手 ${p.order}` : '控え')}
                                onDoubleClick={() => {
                                  if (!setBench) return
                                  // Only allow rename for bench extras (ids starting with bench-)
                                  if (String(p.id).startsWith('bench-')) {
                                    const name = window.prompt('控えの名前を入力', p.name || '')
                                    if (name !== null) setBench(prev => prev.map(b => b.id === p.id ? { ...b, name } : b))
                                  }
                                }}
                              >
                                <span className="block truncate max-w-[8rem]">{p.name || (p.order ? `選手 ${p.order}` : '控え')}</span>
                                {String(p.id).startsWith('bench-') && setBench && (
                                  <button
                                    type="button"
                                    className="text-blue-800 hover:text-red-600"
                                    onClick={(e) => { e.stopPropagation(); setBench(prev => prev.filter(b => b.id !== p.id)) }}
                                    title="削除"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            )}
                          </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
          )}
        </DragDropContext>
        </div>
      </div>
    </div>
  )
}
