import { useRef, useState } from 'react'
import LineupForm from './components/LineupForm'
import FieldView from './components/FieldView'
import MobileActionBar from './components/MobileActionBar'
import { useLocalStorage } from './hooks/useLocalStorage'
import { exportElementAsImage } from './utils/exportImage'

const DEFAULT_LINEUP = () => {
  const players = Array.from({ length: 9 }).map((_, i) => ({
    id: `player-${i + 1}`,
    order: i + 1,
    name: '',
    position: '',
  }))
  const opponentPlayers = Array.from({ length: 9 }).map((_, i) => ({
    id: `opp-${i + 1}`,
    order: i + 1,
    name: '',
    position: '',
  }))
  return {
    team: '',
    opponent: '',
    opponentManager: '',
    manager: '',
    players,
    bench: [],
    pitcher: { name: '' },
    opponentPlayers,
    opponentPitcher: { name: '' },
    opponentBench: [],
    showOpponent: false,
  }
}

export default function App() {
  const [data, setData] = useLocalStorage('lineup-v1', DEFAULT_LINEUP())
  const [mode, setMode] = useState('form') // 'form' | 'field'
  const [fieldSide, setFieldSide] = useState('self') // 'self' | 'opponent'
  const captureRef = useRef(null)

  const setTeam = (v) => setData(prev => ({ ...prev, team: v }))
  const setManager = (v) => setData(prev => ({ ...prev, manager: v }))
  const setOpponent = (v) => setData(prev => ({ ...prev, opponent: v }))
  const setOpponentManager = (v) => setData(prev => ({ ...prev, opponentManager: v }))
  const setPlayers = (updater) => setData(prev => ({ ...prev, players: typeof updater === 'function' ? updater(prev.players) : updater }))
  const setBench = (updater) => setData(prev => ({ ...prev, bench: typeof updater === 'function' ? updater(prev.bench || []) : updater }))
  const setPitcher = (updater) => setData(prev => ({ ...prev, pitcher: typeof updater === 'function' ? updater(prev.pitcher || { name: '' }) : updater }))
  const setOpponentPlayers = (updater) => setData(prev => ({ ...prev, opponentPlayers: typeof updater === 'function' ? updater(prev.opponentPlayers || []) : updater }))
  const setOpponentPitcher = (updater) => setData(prev => ({ ...prev, opponentPitcher: typeof updater === 'function' ? updater(prev.opponentPitcher || { name: '' }) : updater }))
  const setOpponentBench = (updater) => setData(prev => ({ ...prev, opponentBench: typeof updater === 'function' ? updater(prev.opponentBench || []) : updater }))
  const setShowOpponent = (v) => setData(prev => ({ ...prev, showOpponent: v }))

  const handleSave = () => {
    try {
      localStorage.setItem('lineup-v1', JSON.stringify(data))
      alert('保存しました')
    } catch (e) {
      alert('保存に失敗しました')
    }
  }

  const handleReset = () => {
    if (confirm('リセットしますか？')) setData(DEFAULT_LINEUP())
  }

  

  const handleExportImage = async () => {
    await exportElementAsImage(captureRef.current, `${data.team || 'lineup'}.png`)
  }

  return (
    <div className="min-h-dvh bg-white pb-safe-bottom">
      <header className="border-b-4 border-red-400 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold text-baseballBlue">野球スタメンメーカー</h1>
          <div className="flex flex-wrap items-center gap-2">
            <div className="toggle">
              <button className={mode === 'form' ? 'active' : ''} onClick={() => setMode('form')}>フォームモード</button>
              <button className={mode === 'field' ? 'active' : ''} onClick={() => setMode('field')}>野球場モード</button>
            </div>
            {mode === 'form' && (
              <label className="ml-1 inline-flex items-center gap-1 text-blue-900 text-sm select-none">
                <input type="checkbox" className="accent-blue-700 w-4 h-4" checked={!!data.showOpponent} onChange={(e) => setShowOpponent(e.target.checked)} />
                相手オーダー表示
              </label>
            )}
            {mode === 'field' && (
              <div className="toggle">
                <button className={fieldSide === 'self' ? 'active' : ''} onClick={() => setFieldSide('self')}>自チーム</button>
                <button className={fieldSide === 'opponent' ? 'active' : ''} onClick={() => setFieldSide('opponent')}>相手チーム</button>
              </div>
            )}
            <button className="btn btn-secondary" onClick={handleSave}>保存</button>
            
            <button className="btn btn-primary" onClick={handleExportImage}>画像出力</button>
            <button className="btn btn-danger" onClick={handleReset}>リセット</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 overscroll-contain" ref={captureRef}>
        {/* Mobile helper text */}
        <p className="md:hidden text-xs text-blue-800 mb-2">ヒント: 行の≡を長押しで並び替え／フィールドにドラッグで配置できます。</p>
        {mode === 'form' ? (
          <LineupForm
            team={data.team}
            opponent={data.opponent}
            opponentManager={data.opponentManager || ''}
            manager={data.manager}
            setTeam={setTeam}
            setOpponent={setOpponent}
            setOpponentManager={setOpponentManager}
            setManager={setManager}
            players={data.players}
            setPlayers={setPlayers}
            bench={data.bench || []}
            setBench={setBench}
            pitcher={data.pitcher || { name: '' }}
            setPitcher={setPitcher}
            showOpponent={!!data.showOpponent}
            opponentPlayers={data.opponentPlayers || []}
            setOpponentPlayers={setOpponentPlayers}
            opponentPitcher={data.opponentPitcher || { name: '' }}
            setOpponentPitcher={setOpponentPitcher}
            opponentBench={data.opponentBench || []}
            setOpponentBench={setOpponentBench}
          />
        ) : (
          fieldSide === 'self' ? (
            <FieldView
              team={data.team}
              opponent={data.opponent}
              opponentManager={data.opponentManager || ''}
              manager={data.manager}
              players={data.players}
              setPlayers={setPlayers}
              bench={data.bench || []}
              setBench={setBench}
              pitcher={data.pitcher || { name: '' }}
              showOpponent={true}
              opponentPlayers={data.opponentPlayers || []}
              opponentPitcher={data.opponentPitcher || { name: '' }}
              readOnly={false}
            />
          ) : (
            <FieldView
              team={data.opponent}
              opponent={data.team}
              opponentManager={data.manager || ''}
              manager={data.opponentManager || ''}
              players={data.opponentPlayers || []}
              setPlayers={setOpponentPlayers}
              bench={data.opponentBench || []}
              setBench={setOpponentBench}
              pitcher={data.opponentPitcher || { name: '' }}
              showOpponent={true}
              opponentPlayers={data.players || []}
              opponentPitcher={data.pitcher || { name: '' }}
              readOnly={true}
            />
          )
        )}
      </main>
      <footer className="text-center text-sm text-blue-900 py-6">
        <span>Made with React + Tailwind</span>
      </footer>

      {/* Mobile action bar */}
      <MobileActionBar
        mode={mode}
        setMode={setMode}
        onSave={handleSave}
        onExport={handleExportImage}
        onAddBench={() => setBench((prev = []) => ([...prev, { id: `bench-${Date.now()}`, name: '' }]))}
      />
    </div>
  )
}
