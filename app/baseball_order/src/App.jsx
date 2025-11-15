import { useRef, useState } from 'react'
import LineupForm from './components/LineupForm'
import FieldView from './components/FieldView'
import { useLocalStorage } from './hooks/useLocalStorage'
import { exportElementAsImage } from './utils/exportImage'

const DEFAULT_LINEUP = () => {
  const players = Array.from({ length: 9 }).map((_, i) => ({
    id: `player-${i + 1}`,
    order: i + 1,
    name: '',
    position: '',
  }))
  return {
    team: '',
    manager: '',
    players,
    bench: [],
    pitcher: { name: '' },
  }
}

export default function App() {
  const [data, setData] = useLocalStorage('lineup-v1', DEFAULT_LINEUP())
  const [mode, setMode] = useState('form') // 'form' | 'field'
  const captureRef = useRef(null)

  const setTeam = (v) => setData(prev => ({ ...prev, team: v }))
  const setManager = (v) => setData(prev => ({ ...prev, manager: v }))
  const setPlayers = (updater) => setData(prev => ({ ...prev, players: typeof updater === 'function' ? updater(prev.players) : updater }))
  const setBench = (updater) => setData(prev => ({ ...prev, bench: typeof updater === 'function' ? updater(prev.bench || []) : updater }))
  const setPitcher = (updater) => setData(prev => ({ ...prev, pitcher: typeof updater === 'function' ? updater(prev.pitcher || { name: '' }) : updater }))

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
    <div className="min-h-dvh bg-white">
      <header className="border-b-4 border-red-400 bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold text-baseballBlue">野球スタメンメーカー</h1>
          <div className="flex flex-wrap items-center gap-2">
            <div className="toggle">
              <button className={mode === 'form' ? 'active' : ''} onClick={() => setMode('form')}>フォームモード</button>
              <button className={mode === 'field' ? 'active' : ''} onClick={() => setMode('field')}>野球場モード</button>
            </div>
            <button className="btn btn-secondary" onClick={handleSave}>保存</button>
            
            <button className="btn btn-primary" onClick={handleExportImage}>画像出力</button>
            <button className="btn btn-danger" onClick={handleReset}>リセット</button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4" ref={captureRef}>
        {mode === 'form' ? (
          <LineupForm
            team={data.team}
            manager={data.manager}
            setTeam={setTeam}
            setManager={setManager}
            players={data.players}
            setPlayers={setPlayers}
            bench={data.bench || []}
            setBench={setBench}
            pitcher={data.pitcher || { name: '' }}
            setPitcher={setPitcher}
          />
        ) : (
          <FieldView
            team={data.team}
            manager={data.manager}
            players={data.players}
            setPlayers={setPlayers}
            bench={data.bench || []}
            setBench={setBench}
            pitcher={data.pitcher || { name: '' }}
          />
        )}
      </main>
      <footer className="text-center text-sm text-blue-900 py-6">
        <span>Made with React + Tailwind</span>
      </footer>
    </div>
  )
}
