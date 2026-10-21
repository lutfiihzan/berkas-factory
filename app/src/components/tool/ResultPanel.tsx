import { useMemo } from 'react'
import type { OutputFile } from '../../registry/types'
import { downloadBlob, downloadZip, formatBytes, toBlob } from '../../lib/files'
import { Thumb } from './FileCard'

const leafName = (n: string) => n.slice(n.lastIndexOf('/') + 1)

function OutThumb({ file }: { file: File }) {
  const previewable = file.type === 'application/pdf' || file.type.startsWith('image/')
  if (!previewable) {
    return (
      <div className="mx-auto flex aspect-[3/4] w-full max-w-[100px] flex-col items-center justify-center gap-1 rounded-lg bg-navy-50 text-navy-400 ring-1 ring-navy-100">
        <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden><path d="M6 3h8l5 5v13H6z" /><path d="M14 3v5h5" /></svg>
        <span className="text-xs font-bold">{file.name.split('.').pop()?.toUpperCase().slice(0, 4)}</span>
      </div>
    )
  }
  return <Thumb file={file} width={100} />
}

interface Props {
  outputs: OutputFile[]
  mode: 'combine' | 'each'
  failed: number
  doneCount: number
  sizes: { before: number; after: number } | null
  saveMsg: string
  canSaveDir: boolean
  onSaveDir: () => void
}

export default function ResultPanel({ outputs, mode, failed, doneCount, sizes, saveMsg, canSaveDir, onSaveDir }: Props) {
  const files = useMemo(() => outputs.map((o) => new File([toBlob(o)], leafName(o.name), { type: o.type })), [outputs])
  return (
    <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white" aria-hidden>
          <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 10.5 3.2 3.2L15 6.8" /></svg>
        </span>
        <div className="min-w-0">
          <p className="text-lg font-semibold text-navy-900">
            Beres. Filemu ada di perangkatmu, bukan di kami.
            {failed > 0 && mode !== 'each' && <span className="text-rose-700"> {failed} file gagal, yang lain tetap jalan.</span>}
          </p>
          {mode === 'each' && (
            <p className="mt-0.5 text-sm text-navy-600">
              {doneCount} file selesai, {failed} gagal
              {sizes && sizes.before > 0 && <span> &middot; {formatBytes(sizes.before)} &rarr; {formatBytes(sizes.after)}</span>}
            </p>
          )}
        </div>
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {outputs.map((o, i) => (
          <li key={i} className="flex min-w-0 flex-col rounded-2xl bg-white p-3 shadow-card ring-1 ring-navy-100">
            <OutThumb file={files[i]} />
            <p className="mt-3 truncate text-sm font-semibold text-navy-900" title={o.name}>{o.name}</p>
            <p className="text-xs text-navy-500">{formatBytes(o.data.byteLength)}</p>
            <button
              data-testid="download"
              onClick={() => downloadBlob(toBlob(o), leafName(o.name))}
              className="mt-3 rounded-xl bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40"
            >
              Unduh
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {outputs.length > 1 && (
          <button
            data-testid="download-zip"
            onClick={() => downloadZip(outputs)}
            className="rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40"
          >
            Unduh semua (ZIP)
          </button>
        )}
        {canSaveDir && (
          <button
            onClick={onSaveDir}
            className="rounded-xl border border-navy-200 bg-white px-5 py-3 text-sm font-semibold text-navy-800 shadow-sm transition hover:border-navy-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
          >
            Simpan ke folder
          </button>
        )}
        {saveMsg && <span className="text-sm text-navy-600">{saveMsg}</span>}
      </div>
    </section>
  )
}
