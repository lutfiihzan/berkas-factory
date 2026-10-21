import { PDFDocument } from 'pdf-lib'
import type { OutputFile, RunFn } from '../../registry/types'

/** Parse "1-3,5,8-" jadi indeks halaman (basis 0). Dipakai juga oleh rotate & organize. */
export function parseRanges(spec: string, total: number, dedupe = false): number[] {
  const out: number[] = []
  const parts = spec.split(/[,;\s]+/).filter(Boolean)
  if (!parts.length) throw new Error('Isi dulu nomor halamannya, mis. 1-3,5.')
  for (const part of parts) {
    const m = /^(\d*)(-?)(\d*)$/.exec(part)
    if (!m || (!m[1] && !m[3])) throw new Error(`"${part}" bukan nomor halaman yang valid. Contoh yang benar: 1-3,5,8-`)
    let a: number
    let b: number
    if (!m[2]) {
      a = b = Number(m[1])
    } else {
      a = m[1] ? Number(m[1]) : 1
      b = m[3] ? Number(m[3]) : total
    }
    if (a < 1 || b < 1) throw new Error(`Halaman mulai dari 1 ("${part}").`)
    if (a > total || b > total) throw new Error(`PDF ini hanya punya ${total} halaman, tapi kamu menulis "${part}".`)
    if (a > b) throw new Error(`Rentang "${part}" terbalik. Tulis dari yang kecil, mis. ${b}-${a}.`)
    for (let i = a; i <= b; i++) out.push(i - 1)
  }
  return dedupe ? Array.from(new Set(out)) : out
}

export interface SplitOptions {
  mode: 'range' | 'every' | 'each'
  range: string
  n: number
}

const base = (name: string) => name.replace(/\.pdf$/i, '')

export const run: RunFn<SplitOptions> = async (inputs, opts, { progress }) => {
  const src = await PDFDocument.load(inputs[0].data)
  const total = src.getPageCount()
  const name = base(inputs[0].name)
  let groups: number[][]
  if (opts.mode === 'range') {
    groups = [parseRanges(opts.range, total, true)]
  } else {
    const n = opts.mode === 'each' ? 1 : Math.floor(Number(opts.n))
    if (!Number.isFinite(n) || n < 1) throw new Error('Jumlah halaman per file harus 1 atau lebih.')
    groups = []
    for (let i = 0; i < total; i += n) groups.push(src.getPageIndices().slice(i, i + n))
  }
  const out: OutputFile[] = []
  const pad = String(groups.length).length
  for (let g = 0; g < groups.length; g++) {
    progress(g, groups.length, 'Memisah')
    const doc = await PDFDocument.create()
    const pages = await doc.copyPages(src, groups[g])
    pages.forEach((p) => doc.addPage(p))
    const fname = opts.mode === 'range' ? `${name}-terpilih.pdf` : `${name}-${String(g + 1).padStart(pad, '0')}.pdf`
    out.push({ name: fname, data: await doc.save(), type: 'application/pdf' })
  }
  progress(groups.length, groups.length, 'Memisah')
  return out
}
