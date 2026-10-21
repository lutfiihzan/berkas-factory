import { PDFDocument } from 'pdf-lib'
import type { OutputFile, RunFn } from '../../registry/types'

const LOAD = { ignoreEncryption: true, throwOnInvalidObject: false, updateMetadata: false } as const
const latin1 = (b: Uint8Array) => new TextDecoder('latin1').decode(b)
const bytes = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 255)

async function tryLoad(data: Uint8Array): Promise<PDFDocument | null> {
  try {
    const d = await PDFDocument.load(data, LOAD)
    return d.getPageCount() > 0 ? d : null
  } catch {
    return null
  }
}

function concat(...parts: Uint8Array[]) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let o = 0
  for (const p of parts) {
    out.set(p, o)
    o += p.length
  }
  return out
}

/** Bangun trailer sendiri: cari objek halaman lewat scan, buat Pages + Catalog baru. */
function synthesize(body: Uint8Array, text: string): Uint8Array | null {
  const re = /(\d+)\s+(\d+)\s+obj\b/g
  const starts: Array<{ n: number; g: number; at: number }> = []
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) starts.push({ n: +m[1], g: +m[2], at: m.index })
  if (!starts.length) return null
  let max = 0
  const pages: string[] = []
  for (const s of starts) {
    max = Math.max(max, s.n)
    const end = text.indexOf('endobj', s.at)
    const seg = text.slice(s.at, end < 0 ? text.length : end)
    if (/\/Type\s*\/Page(?![A-Za-z])/.test(seg)) pages.push(`${s.n} ${s.g} R`)
  }
  if (!pages.length) return null
  const pagesId = max + 1
  const rootId = max + 2
  const tail =
    `\n${pagesId} 0 obj\n<< /Type /Pages /Count ${pages.length} /Kids [${pages.join(' ')}] >>\nendobj\n` +
    `${rootId} 0 obj\n<< /Type /Catalog /Pages ${pagesId} 0 R >>\nendobj\n` +
    `trailer\n<< /Size ${rootId + 1} /Root ${rootId} 0 R >>\nstartxref\n0\n%%EOF\n`
  return concat(body, bytes(tail))
}

/** Salin halaman satu per satu ke dokumen baru supaya halaman rusak bisa dilewati. */
async function copyGood(src: PDFDocument): Promise<PDFDocument | null> {
  const out = await PDFDocument.create()
  for (let i = 0; i < src.getPageCount(); i++) {
    try {
      const [p] = await out.copyPages(src, [i])
      out.addPage(p)
    } catch {
      /* lewati halaman yang tidak bisa disalin */
    }
  }
  return out.getPageCount() > 0 ? out : null
}

async function salvage(data: Uint8Array): Promise<{ doc: PDFDocument; how: string } | null> {
  // (a) muat apa adanya, simpan ulang (xref dibangun ulang)
  const a = await tryLoad(data)
  if (a) return { doc: a, how: 'disimpan ulang' }

  // (b) potong sampah di depan, bersihkan ekor, tambah %%EOF
  const text = latin1(data)
  const hdr = text.indexOf('%PDF-')
  if (hdr < 0) return null
  let body = data.subarray(hdr)
  let t = text.slice(hdr)
  if (hdr > 0) {
    const d = await tryLoad(body)
    if (d) return { doc: d, how: 'sampah di awal dibuang' }
  }
  const lastEnd = t.lastIndexOf('endobj')
  if (lastEnd < 0) return null
  body = body.subarray(0, lastEnd + 6)
  t = t.slice(0, lastEnd + 6)
  const b = await tryLoad(concat(body, bytes('\n%%EOF\n')))
  if (b) return { doc: b, how: 'ujung file ditambal' }

  // (b2) bangun trailer + daftar halaman sendiri dari hasil scan
  const syn = synthesize(body, t)
  if (syn) {
    const src = await tryLoad(syn)
    if (src) {
      const good = await copyGood(src)
      if (good) return { doc: good, how: 'daftar halaman dibangun ulang dari hasil scan' }
    }
  }
  return null
}

export const run: RunFn = async (inputs, _options, { progress }) => {
  const out: OutputFile[] = []
  const failed: string[] = []
  for (let i = 0; i < inputs.length; i++) {
    const f = inputs[i]
    progress(i, inputs.length, `Mencoba menyelamatkan ${f.name}`)
    let res: Awaited<ReturnType<typeof salvage>> = null
    try {
      res = await salvage(f.data)
    } catch {
      res = null
    }
    if (!res) {
      failed.push(f.name)
      continue
    }
    const n = res.doc.getPageCount()
    const data = await res.doc.save({ useObjectStreams: false })
    out.push({ name: f.name.replace(/\.pdf$/i, '') + '-pulih.pdf', data, type: 'application/pdf' })
    progress(i + 1, inputs.length, `${f.name}: ${n} halaman terselamatkan (${res.how})`)
  }
  if (!out.length) {
    throw new Error(
      `Tidak bisa diselamatkan: ${failed.join(', ')}. Isi file terlalu rusak atau bagian pentingnya sudah hilang.`,
    )
  }
  if (failed.length) progress(inputs.length, inputs.length, `Sebagian beres. Tidak bisa diselamatkan: ${failed.join(', ')}`)
  return out
}
