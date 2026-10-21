import './tool.css'

interface Props {
  /** 0..1, atau null bila tidak bisa dihitung (bar indeterminate) */
  fraction: number | null
  done: number
  total: number
  /** nama file / halaman yang sedang dikerjakan */
  current?: string
  heading?: string
  /** perkiraan sisa waktu dalam detik */
  etaSec?: number | null
  onCancel: () => void
}

export function formatEta(s: number): string {
  if (s < 5) return 'sebentar lagi'
  if (s < 60) return `sekitar ${Math.round(s / 5) * 5} detik lagi`
  const m = Math.ceil(s / 60)
  return `sekitar ${m} menit lagi`
}

export default function ProgressPanel({ fraction, done, total, heading, current, etaSec, onCancel }: Props) {
  const pct = fraction === null ? null : Math.max(0, Math.min(100, Math.round(fraction * 100)))
  return (
    <section className="mt-6 rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy-100 sm:p-6" aria-live="polite">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-navy-800">
            {heading ?? `Mengerjakan ${Math.min(total, done + 1)} dari ${total} file`}
          </p>
          <p className="mt-0.5 truncate text-sm text-navy-500" title={current}>{current || 'Menyiapkan…'}</p>
        </div>
        <p className="shrink-0 text-4xl font-bold tabular-nums text-navy-900">{pct === null ? '…' : `${pct}%`}</p>
      </div>

      <div
        role="progressbar"
        aria-label="Progres pengerjaan"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct ?? undefined}
        aria-valuetext={pct === null ? 'Sedang diproses' : `${pct} persen`}
        className="relative mt-4 h-4 overflow-hidden rounded-full bg-navy-100"
      >
        {pct === null ? (
          <div className="bf-indet absolute inset-y-0 left-0 w-2/5 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600" />
        ) : (
          <div className="bf-shimmer h-full rounded-full transition-[width] duration-300 ease-out" style={{ width: `${Math.max(pct, 3)}%` }} />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-navy-500">
          {etaSec != null ? `Perkiraan sisa waktu: ${formatEta(etaSec)}` : 'Semua diproses di perangkatmu.'}
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-navy-200 bg-white px-5 py-2 text-sm font-semibold text-navy-800 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
        >
          Batal
        </button>
      </div>
    </section>
  )
}
