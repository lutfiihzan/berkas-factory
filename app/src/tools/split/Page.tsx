import { useEffect, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import ToolPage, { type OptionsProps } from '../../components/ToolPage'
import { RadioRow, inputCls } from '../../components/tool/controls'
import { parseRanges, type SplitOptions } from './run'

function Options({ value, onChange, files }: OptionsProps<SplitOptions>) {
  const [total, setTotal] = useState(0)
  useEffect(() => {
    let ok = true
    setTotal(0)
    if (files[0]) {
      files[0].arrayBuffer()
        .then((b) => PDFDocument.load(b))
        .then((d) => { if (ok) setTotal(d.getPageCount()) })
        .catch(() => {})
    }
    return () => { ok = false }
  }, [files])
  const set = (p: Partial<SplitOptions>) => onChange({ ...value, ...p })
  let hint = ''
  if (total && value.mode === 'range' && value.range.trim()) {
    try { hint = `Hasil: ${parseRanges(value.range, total, true).length} halaman.` } catch (e) { hint = e instanceof Error ? e.message : '' }
  } else if (total && value.mode === 'every') {
    const n = Math.floor(value.n)
    hint = n >= 1 ? `Hasil: ${Math.ceil(total / n)} file.` : 'Jumlah halaman per file harus 1 atau lebih.'
  } else if (total && value.mode === 'each') hint = `Hasil: ${total} file.`
  return (
    <div className="space-y-3 text-sm">
      {total > 0 && <p className="font-medium text-navy-600">PDF ini punya {total} halaman.</p>}
      <RadioRow checked={value.mode === 'range'} onChange={() => set({ mode: 'range' })}>
        Ambil halaman tertentu
      </RadioRow>
      {value.mode === 'range' && (
        <input className={inputCls} value={value.range} placeholder="1-3,5,8-" onChange={(e) => set({ range: e.target.value })} />
      )}
      <RadioRow checked={value.mode === 'every'} onChange={() => set({ mode: 'every' })}>
        Pisah tiap
        <input type="number" min={1} className="w-24 rounded-xl border border-navy-200 bg-white px-3 py-1.5 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20" value={value.n}
          onChange={(e) => set({ mode: 'every', n: Number(e.target.value) })} />
        halaman
      </RadioRow>
      <RadioRow checked={value.mode === 'each'} onChange={() => set({ mode: 'each' })}>
        Satu file per halaman
      </RadioRow>
      {hint && <p className="font-medium text-brand-700">{hint}</p>}
    </div>
  )
}

export default function Page() {
  return (
    <ToolPage<SplitOptions>
      toolId="split"
      title="Pisah PDF"
      blurb="Ambil halaman tertentu atau pecah PDF jadi beberapa file. Cukup satu file PDF."
      accept="application/pdf,.pdf"
      mode="combine"
      defaultOptions={{ mode: 'range', range: '', n: 2 }}
      Options={Options}
      actionLabel={() => 'Pisah PDF'}
      canRun={(o) =>
        o.mode === 'range' && !o.range.trim() ? 'Tulis dulu halaman yang mau diambil, mis. 1-3,5.'
          : o.mode === 'every' && !(Math.floor(o.n) >= 1) ? 'Jumlah halaman per file harus 1 atau lebih.' : null}
    />
  )
}
