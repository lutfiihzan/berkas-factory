import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { categoryLabel, tools } from '../registry'
import type { ToolDefinition } from '../registry/types'
import ToolIcon from './ToolIcon'

export const OPEN_PALETTE_EVENT = 'berkasfactory:open-palette'

// id tool -> kata kunci sehari-hari
const synonyms: Record<string, string> = {
  compress: 'kecilin perkecil ukuran compress kurangi kompres kecil besar berat',
  'image-compress': 'kecilin perkecil ukuran compress kurangi kompres foto gambar',
  merge: 'gabung satukan combine gabungin jadiin satu',
  split: 'pisah potong ekstrak pecah bagi',
  rotate: 'putar miring kebalik terbalik balik',
  protect: 'kunci password sandi proteksi lindungi',
  unlock: 'buka kunci hapus password sandi',
  watermark: 'tanda air cap logo stempel',
  'page-numbers': 'nomor halaman paginasi',
  'pdf-to-image': 'jpg png gambar foto ubah jadi',
  'image-to-pdf': 'foto jadi pdf scan gambar jpg png',
  organize: 'atur urut hapus halaman susun pindah',
  'remove-bg': 'background latar hapus latar belakang transparan',
  ocr: 'teks scan baca hasil salin',
  repair: 'perbaiki rusak error corrupt',
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

// Peringkat: awalan nama > berisi di nama > sinonim > deskripsi
function tokenScore(tok: string, t: ToolDefinition): number {
  const name = norm(t.name)
  if (name.startsWith(tok)) return 100
  if (name.split(/\s+/).some((w) => w.startsWith(tok))) return 90
  if (name.includes(tok)) return 80
  const syn = norm(synonyms[t.id] ?? '')
  if (syn.split(/\s+/).some((w) => w.startsWith(tok))) return 60
  if (syn.includes(tok)) return 50
  if (norm(t.description).includes(tok)) return 30
  return 0
}

function search(q: string): ToolDefinition[] {
  const toks = norm(q).split(/\s+/).filter(Boolean)
  const rank = (t: ToolDefinition) => {
    if (!toks.length) return 1
    const s = toks.map((k) => tokenScore(k, t))
    return s.includes(0) ? 0 : Math.min(...s)
  }
  return tools
    .map((t) => ({ t, s: rank(t) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => {
      const ca = a.t.status === 'coming-soon' ? 1 : 0
      const cb = b.t.status === 'coming-soon' ? 1 : 0
      return ca - cb || b.s - a.s || a.t.name.localeCompare(b.t.name, 'id')
    })
    .map((x) => x.t)
}

const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform)
const enabled = (t?: ToolDefinition) => !!t && t.status !== 'coming-soon'

export function PaletteTrigger({ light = false }: { light?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
      className={
        'flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 ' +
        (light
          ? 'w-full border-navy-200 bg-navy-50 text-navy-700 hover:bg-navy-100'
          : 'border-white/20 bg-white/10 text-navy-100 hover:bg-white/20')
      }
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m20 20-4-4" />
      </svg>
      Cari tool
      <kbd className={'ml-auto rounded-md border px-1.5 text-xs ' + (light ? 'border-navy-200 bg-white text-navy-500' : 'border-white/25 bg-white/10 text-navy-200')}>
        {isMac ? '⌘ K' : 'Ctrl K'}
      </kbd>
    </button>
  )
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const uid = useId()

  const results = useMemo(() => search(query), [query])

  const show = useCallback(() => {
    returnFocus.current = document.activeElement as HTMLElement | null
    setQuery('')
    setActive(0)
    setOpen(true)
  }, [])
  const close = useCallback(() => {
    setOpen(false)
    returnFocus.current?.focus?.()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (open) close()
        else show()
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_PALETTE_EVENT, show)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_PALETTE_EVENT, show)
    }
  }, [open, show, close])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    inputRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // hasil teratas yang bisa dibuka langsung tersorot
  useEffect(() => {
    const i = results.findIndex((t) => enabled(t))
    setActive(i < 0 ? 0 : i)
  }, [results])

  useEffect(() => {
    if (open) document.getElementById(`${uid}-opt-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open, uid])

  if (!open) return null

  const go = (t?: ToolDefinition) => {
    if (!t || !enabled(t)) return
    setOpen(false)
    navigate(`/${t.slug}`)
  }
  const move = (dir: 1 | -1) => {
    let i = active
    for (let n = 0; n < results.length; n++) {
      i = (i + dir + results.length) % results.length
      if (enabled(results[i])) return setActive(i)
    }
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      move(1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      move(-1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      go(results[active])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'Tab') e.preventDefault()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-navy-950/60 p-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cari tool"
        onKeyDown={onKeyDown}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card-hover"
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          role="combobox"
          aria-expanded="true"
          aria-controls={`${uid}-list`}
          aria-activedescendant={results.length ? `${uid}-opt-${active}` : undefined}
          aria-autocomplete="list"
          aria-label="Cari tool"
          placeholder="Mau ngapain? mis. kecilin, gabung, putar"
          className="w-full border-b border-navy-100 bg-transparent px-4 py-3.5 text-base text-navy-900 outline-none placeholder:text-navy-400"
        />
        {results.length ? (
          <ul id={`${uid}-list`} role="listbox" aria-label="Hasil pencarian" className="max-h-80 overflow-y-auto p-2">
            {results.map((t, i) => {
              const off = !enabled(t)
              return (
                <li
                  key={t.id}
                  id={`${uid}-opt-${i}`}
                  role="option"
                  aria-selected={i === active}
                  aria-disabled={off || undefined}
                  onMouseMove={() => !off && setActive(i)}
                  onClick={() => go(t)}
                  className={
                    'flex items-center gap-3 rounded-xl px-3 py-2 transition-colors ' +
                    (off
                      ? 'cursor-not-allowed text-navy-400 opacity-70'
                      : 'cursor-pointer ' + (i === active ? 'bg-navy-100 text-navy-900' : 'text-navy-800'))
                  }
                >
                  <ToolIcon id={t.id} size={28} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{t.name}</span>
                    <span className="block truncate text-xs text-navy-500">{t.description}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-navy-50 px-2 py-0.5 text-xs text-navy-600">
                    {off ? 'Segera hadir' : categoryLabel[t.category]}
                  </span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="px-4 py-8 text-center text-sm text-navy-500" role="status">
            Tidak ada yang cocok. Coba kata lain, atau kasih tahu kami lewat Kasih masukan.
          </p>
        )}
        <div className="flex gap-4 border-t border-navy-100 bg-navy-50 px-4 py-2 text-xs text-navy-500">
          <span>{'↑↓'} pilih</span>
          <span>Enter buka</span>
          <span>Esc tutup</span>
        </div>
      </div>
    </div>
  )
}
