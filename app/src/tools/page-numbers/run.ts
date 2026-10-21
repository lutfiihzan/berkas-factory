import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import type { OutputFile, RunFn } from '../../registry/types'

interface Opts {
  position: 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-left' | 'top-center' | 'top-right'
  format: 'n' | 'halaman' | 'n-of-total'
  startNumber: number
  startPage: number
  fontSize: number
}

export const run: RunFn<Opts> = async (inputs, opts, { progress }) => {
  const o = opts
  const out: OutputFile[] = []
  for (let i = 0; i < inputs.length; i++) {
    progress(i, inputs.length, 'Memberi nomor')
    const doc = await PDFDocument.load(inputs[i].data)
    const font = await doc.embedFont(StandardFonts.Helvetica)
    const pages = doc.getPages()
    const first = Math.max(1, o.startPage)
    const total = o.startNumber + Math.max(0, pages.length - first)
    pages.forEach((page, idx) => {
      if (idx + 1 < first) return
      const n = o.startNumber + (idx + 1 - first)
      const text = o.format === 'halaman' ? `Halaman ${n}` : o.format === 'n-of-total' ? `${n} / ${total}` : String(n)
      const { width, height } = page.getSize()
      const w = font.widthOfTextAtSize(text, o.fontSize)
      const m = 28
      const [v, h] = o.position.split('-')
      const x = h === 'left' ? m : h === 'right' ? width - m - w : (width - w) / 2
      const y = v === 'bottom' ? m : height - m - o.fontSize
      page.drawText(text, { x, y, size: o.fontSize, font, color: rgb(0, 0, 0) })
    })
    out.push({
      name: inputs[i].name.replace(/\.pdf$/i, '') + '-nomor.pdf',
      data: await doc.save(),
      type: 'application/pdf',
    })
  }
  progress(inputs.length, inputs.length, 'Memberi nomor')
  return out
}
