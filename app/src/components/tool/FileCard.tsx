import type { DragEvent } from 'react'
import { formatBytes } from '../../lib/files'
import { usePageCount, usePreview } from '../../lib/thumbs'
import type { Item } from '../ToolPage'
import './tool.css'

/** Thumbnail halaman pertama dengan rasio kertas; placeholder berkedip saat memuat, label format bila gagal. */
export function Thumb({ file, width = 140, className = '' }: { file: File; width?: number; className?: string }) {
  const src = usePreview(file, 1, width)
  return (
    <div className={`relative mx-auto aspect-[3/4] w-full overflow-hidden rounded-lg bg-white ring-1 ring-navy-100 ${className}`} style={{ maxWidth: width }}>
      {src === null ? (
        <div className="absolute inset-0 animate-pulse bg-navy-100" />
      ) : src ? (
        <img src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full select-none object-contain" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-navy-50 text-navy-400">
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
            <path d="M6 3h8l5 5v13H6z" />
            <path d="M14 3v5h5" />
          </svg>
          <span className="text-xs font-bold tracking-wide">{file.name.split('.').pop()?.toUpperCase().slice(0, 4)}</span>
        </div>
      )}
    </div>
  )
}

/** Cincin progres bulat. frac undefined = berputar (tak diketahui). */
function Ring({ frac }: { frac?: number }) {
  const r = 20
  const c = 2 * Math.PI * r
  const known = typeof frac === 'number'
  return (
    <span className="relative flex size-14 items-center justify-center rounded-full bg-white shadow-card" role="progressbar" aria-label="Progres file" aria-valuemin={0} aria-valuemax={100} aria-valuenow={known ? Math.round(frac * 100) : undefined}>
      <svg viewBox="0 0 48 48" className={`absolute inset-0 -rotate-90 ${known ? '' : 'animate-spin'}`}>
        <circle cx="24" cy="24" r={r} fill="none" strokeWidth="4" className="stroke-navy-100" />
        <circle
          cx="24" cy="24" r={r} fill="none" strokeWidth="4" strokeLinecap="round"
          className="stroke-brand-500 transition-[stroke-dashoffset] duration-300"
          strokeDasharray={c}
          strokeDashoffset={known ? c * (1 - Math.max(0.03, Math.min(1, frac))) : c * 0.72}
        />
      </svg>
      {known && <span className="text-[11px] font-bold text-navy-800">{Math.round(frac * 100)}%</span>}
    </span>
  )
}

interface Props {
  item: Item
  index: number
  /** tampilkan nomor urut (mode gabung) */
  numbered: boolean
  canReorder: boolean
  busy: boolean
  count: number
  dragging: boolean
  dropTarget: boolean
  dragProps: {
    draggable: boolean
    onDragStart: (e: DragEvent) => void
    onDragOver: (e: DragEvent) => void
    onDrop: (e: DragEvent) => void
    onDragEnd: () => void
  }
  /** Fraksi progres gabungan untuk mode combine (semua kartu berbagi satu pekerjaan) */
  sharedFrac?: number
  onMove: (d: -1 | 1) => void
  onRemove: () => void
}

const chevron = 'size-4'

export default function FileCard({ item, index, numbered, canReorder, busy, count, dragging, dropTarget, dragProps, sharedFrac, onMove, onRemove }: Props) {
  const pages = usePageCount(item.file)
  const name = item.path || item.file.name
  const frac = item.frac ?? sharedFrac
  return (
    <li
      {...dragProps}
      data-status={item.status}
      className={`group relative flex min-w-0 flex-col rounded-2xl bg-white p-3 shadow-card ring-1 transition ${
        item.status === 'error' ? 'ring-rose-300' : dropTarget ? 'ring-2 ring-brand-500' : 'ring-navy-100 hover:shadow-card-hover'
      } ${canReorder ? 'cursor-grab active:cursor-grabbing' : ''} ${dragging ? 'scale-95 opacity-40' : ''}`}
    >
      {numbered && (
        <span className="absolute -left-2 -top-2 z-10 flex size-7 items-center justify-center rounded-full bg-navy-800 text-xs font-bold text-white shadow-card" aria-label={`Urutan ${index + 1}`}>
          {index + 1}
        </span>
      )}
      {!busy && (
        <button
          aria-label="Hapus"
          title="Hapus"
          onClick={onRemove}
          className="absolute -right-2 -top-2 z-10 flex size-7 items-center justify-center rounded-full bg-white text-lg leading-none text-navy-500 shadow-card ring-1 ring-navy-100 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          &times;
        </button>
      )}

      <div className="relative">
        <Thumb file={item.file} />
        {item.status === 'running' && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-[1px]">
            <Ring frac={frac} />
          </div>
        )}
        {item.status === 'done' && (
          <span className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-card" role="img" aria-label="Selesai">
            <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 10.5 3.2 3.2L15 6.8" /></svg>
          </span>
        )}
        {item.status === 'error' && (
          <span className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full bg-rose-500 text-lg font-bold text-white shadow-card" role="img" aria-label="Gagal">!</span>
        )}
      </div>

      <p className="mt-3 truncate text-sm font-semibold text-navy-900" title={name}>{name}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-navy-500">
        <span>{formatBytes(item.file.size)}</span>
        {typeof pages === 'number' && <><span aria-hidden>&middot;</span><span>{pages} hal.</span></>}
      </p>
      <p className="mt-1 truncate text-xs font-medium text-navy-500" aria-live="polite">
        {item.status === 'running' ? <span className="text-brand-600">Diproses{item.note ? `: ${item.note}` : '…'}</span> : item.status === 'done' ? <span className="text-emerald-600">Selesai</span> : item.status === 'error' ? <span className="text-rose-600">Gagal</span> : <span>Menunggu</span>}
      </p>
      {item.status === 'error' && item.error && (
        <p data-testid="item-error" title={item.error} className="mt-1 line-clamp-3 break-words text-xs text-red-700">{item.error}</p>
      )}

      {canReorder && count > 1 && (
        <div className="mt-2 flex items-center justify-center gap-1 border-t border-navy-50 pt-2">
          <button aria-label="Naikkan" title="Geser lebih awal" disabled={index === 0} onClick={() => onMove(-1)} className="rounded-lg p-1.5 text-navy-500 transition hover:bg-navy-50 hover:text-navy-900 disabled:opacity-30">
            <svg viewBox="0 0 20 20" className={chevron} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m12 5-5 5 5 5" /></svg>
          </button>
          <button aria-label="Turunkan" title="Geser lebih akhir" disabled={index === count - 1} onClick={() => onMove(1)} className="rounded-lg p-1.5 text-navy-500 transition hover:bg-navy-50 hover:text-navy-900 disabled:opacity-30">
            <svg viewBox="0 0 20 20" className={chevron} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m8 5 5 5-5 5" /></svg>
          </button>
        </div>
      )}
    </li>
  )
}
