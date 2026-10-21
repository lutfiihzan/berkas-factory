import './tool.css'

export function acceptLabel(accept: string): string {
  const exts = accept.split(',').map((a) => a.trim().toLowerCase()).filter((a) => a.startsWith('.')).map((a) => a.slice(1).toUpperCase())
  if (exts.length) return Array.from(new Set(exts)).join(', ')
  return accept.split(',').map((a) => a.trim().split('/').pop()?.replace('*', '').toUpperCase() || 'FILE').join(', ')
}

const Check = () => (
  <svg viewBox="0 0 20 20" className="size-5 shrink-0 text-emerald-600" fill="currentColor" aria-hidden>
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.3a1 1 0 0 0-1.4-1.4L9 10.58 7.7 9.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4Z" clipRule="evenodd" />
  </svg>
)

export function Benefits() {
  return (
    <ul className="mt-5 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-navy-700">
      {['Diproses di browsermu', 'Filemu tidak diunggah', 'Tanpa akun dan tanpa watermark'].map((t) => (
        <li key={t} className="flex items-center gap-2">
          <Check />
          {t}
        </li>
      ))}
    </ul>
  )
}

interface Props {
  accept: string
  multiple?: boolean
  over: boolean
  onPick: () => void
  onPickFolder?: () => void
  onPaste: () => void
}

export default function UploadZone({ accept, multiple, over, onPick, onPickFolder, onPaste }: Props) {
  return (
    <div
      onClick={onPick}
      className={`relative mt-6 cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed px-5 py-10 text-center transition-all duration-200 sm:px-10 sm:py-14 ${
        over
          ? 'scale-[1.015] border-brand-500 bg-brand-500/10 shadow-card-hover'
          : 'border-navy-300 bg-gradient-to-b from-navy-100 to-navy-50 hover:border-navy-400 hover:shadow-card'
      }`}
    >
      <span
        aria-hidden
        className={`mx-auto flex size-20 items-center justify-center rounded-full bg-white text-brand-500 shadow-card ${over ? 'bf-breathe' : ''}`}
      >
        <svg viewBox="0 0 24 24" className={`size-10 transition-transform ${over ? '-translate-y-1' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 8.5a4 4 0 0 1 .5 7.97" />
          <path d="M12 21v-9" />
          <path d="m8.5 15 3.5-3.5 3.5 3.5" />
        </svg>
      </span>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPick() }}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-9 py-4 text-lg font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40 active:scale-[0.98]"
        >
          Pilih file
        </button>
        {multiple && onPickFolder && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPickFolder() }}
            className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-5 py-3.5 text-sm font-semibold text-navy-800 shadow-sm transition hover:border-navy-400 hover:bg-navy-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
          >
            <svg viewBox="0 0 20 20" className="size-4 text-navy-500" fill="currentColor" aria-hidden>
              <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h3.17a1.5 1.5 0 0 1 1.06.44L8.8 5.5h7.7A1.5 1.5 0 0 1 18 7v7.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 14.5v-9Z" />
            </svg>
            Pilih folder
          </button>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPaste() }}
          title="Atau tekan Ctrl+V"
          className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-5 py-3.5 text-sm font-semibold text-navy-800 shadow-sm transition hover:border-navy-400 hover:bg-navy-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
        >
          <svg viewBox="0 0 20 20" className="size-4 text-navy-500" fill="currentColor" aria-hidden>
            <path d="M8 2a1.5 1.5 0 0 0-1.42 1H5.5A1.5 1.5 0 0 0 4 4.5v11A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 14.5 3h-1.08A1.5 1.5 0 0 0 12 2H8Zm0 1.5h4v1H8v-1Z" />
          </svg>
          Tempel
        </button>
      </div>

      <p className="mt-5 text-base font-medium text-navy-700">
        {over ? 'Lepas di sini' : multiple ? 'atau tarik dan lepas file di sini' : 'atau tarik dan lepas satu file di sini'}
      </p>
      <p className="mt-1 text-sm text-navy-500">
        Format: {acceptLabel(accept)}. Bisa juga tempel dengan Ctrl+V. Filemu tidak diunggah ke mana pun.
      </p>
    </div>
  )
}
