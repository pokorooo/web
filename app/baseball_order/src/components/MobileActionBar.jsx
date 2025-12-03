export default function MobileActionBar({ mode, setMode, onSave, onExport, onAddBench }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 shadow-top-soft" role="navigation" aria-label="操作">
      <div className="max-w-2xl mx-auto grid grid-cols-4 gap-1 py-2 px-2">
        <button
          type="button"
          className="flex flex-col items-center justify-center gap-1 py-1.5 text-xs text-blue-900"
          onClick={() => setMode(mode === 'form' ? 'field' : 'form')}
          aria-label={mode === 'form' ? '野球場モードに切替' : 'フォームモードに切替'}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {mode === 'form' ? (
              <>
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <path d="M3 8h18" />
              </>
            ) : (
              <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v18M3 12h18" />
              </>
            )}
          </svg>
          <span>{mode === 'form' ? '野球場' : 'フォーム'}</span>
        </button>

        <button
          type="button"
          className="flex flex-col items-center justify-center gap-1 py-1.5 text-xs text-blue-900"
          onClick={onSave}
          aria-label="保存"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>保存</span>
        </button>

        <button
          type="button"
          className="flex flex-col items-center justify-center gap-1 py-1.5 text-xs text-blue-900"
          onClick={onExport}
          aria-label="画像出力"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="3" width="18" height="14" rx="2" />
            <path d="M8 21h8" />
            <path d="M12 17v4" />
          </svg>
          <span>出力</span>
        </button>

        <button
          type="button"
          className="flex flex-col items-center justify-center gap-1 py-1.5 text-xs text-blue-900"
          onClick={onAddBench}
          aria-label="控え追加"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          <span>控え</span>
        </button>
      </div>
    </nav>
  )
}

