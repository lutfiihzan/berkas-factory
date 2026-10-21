import { PDFDocument } from 'pdf-lib'
import { pdfjs } from '../../lib/pdfjs'
import type { OutputFile, RunFn } from '../../registry/types'

type Level = 'ringan' | 'sedang' | 'kuat'
const PRESET: Record<Level, { dpi: number; q: number }> = {
  ringan: { dpi: 130, q: 0.8 },
  sedang: { dpi: 100, q: 0.6 },
  kuat: { dpi: 72, q: 0.4 },
}

export const run: RunFn<{ level?: Level }> = async (inputs, options, { progress }) => {
  const { dpi, q } = PRESET[options?.level ?? 'sedang']
  const out: OutputFile[] = []
  for (const f of inputs) {
    const original = f.data.slice()
    const doc = await pdfjs.getDocument({ data: f.data }).promise
    const result = await PDFDocument.create()
    for (let n = 1; n <= doc.numPages; n++) {
      progress(n - 1, doc.numPages, `Mengompres ${f.name}`)
      const page = await doc.getPage(n)
      const base = page.getViewport({ scale: 1 })
      const vp = page.getViewport({ scale: dpi / 72 })
      const canvas = new OffscreenCanvas(Math.ceil(vp.width), Math.ceil(vp.height))
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      await page.render({ canvas: canvas as unknown as HTMLCanvasElement, viewport: vp }).promise
      const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: q })
      const img = await result.embedJpg(new Uint8Array(await blob.arrayBuffer()))
      result.addPage([base.width, base.height]).drawImage(img, { x: 0, y: 0, width: base.width, height: base.height })
      page.cleanup()
    }
    await doc.loadingTask.destroy()
    const data = await result.save()
    if (data.byteLength >= original.byteLength) {
      progress(inputs.length, inputs.length, `${f.name}: sudah sekecil mungkin, file asli dikembalikan`)
      out.push({ name: f.name, data: original, type: 'application/pdf' })
    } else {
      out.push({ name: f.name.replace(/\.pdf$/i, '') + '-kecil.pdf', data, type: 'application/pdf' })
    }
  }
  return out
}
