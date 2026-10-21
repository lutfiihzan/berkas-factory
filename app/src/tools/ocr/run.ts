import { createWorker } from 'tesseract.js'
import { PDFDocument } from 'pdf-lib'
import { pdfjs } from '../../lib/pdfjs'
import type { OutputFile, RunFn } from '../../registry/types'

interface Opts {
  lang?: 'ind+eng' | 'ind' | 'eng'
  format?: 'txt' | 'pdf'
}

const DPI = 200
const baseName = (n: string) => n.replace(/\.[^.]+$/, '')
const isPdf = (n: string) => /\.pdf$/i.test(n)
const mimeOf = (n: string) => (/\.png$/i.test(n) ? 'image/png' : /\.webp$/i.test(n) ? 'image/webp' : 'image/jpeg')

// Tesseract tidak membaca WebP; ubah ke PNG lewat canvas.
async function webpToPng(blob: Blob): Promise<Uint8Array> {
  const bmp = await createImageBitmap(blob)
  const c = new OffscreenCanvas(bmp.width, bmp.height)
  c.getContext('2d')!.drawImage(bmp, 0, 0)
  bmp.close()
  return new Uint8Array(await (await c.convertToBlob({ type: 'image/png' })).arrayBuffer())
}

export const run: RunFn<Opts> = async (inputs, options, { progress }) => {
  const lang = (options?.lang ?? 'ind+eng').split('+')
  const wantPdf = options?.format === 'pdf'
  const origin = self.location.origin

  // Hitung total halaman lebih dulu supaya progres jujur.
  const docs = new Map<string, Awaited<ReturnType<typeof pdfjs.getDocument>['promise']>>()
  let total = 0
  for (const f of inputs) {
    if (isPdf(f.name)) {
      const d = await pdfjs.getDocument({ data: f.data.slice() }).promise
      docs.set(f.name, d)
      total += d.numPages
    } else total += 1
  }

  let page = 0
  let pct = 0
  const label = () => `Mengenali teks hal. ${Math.min(page + 1, total)}/${total} (${Math.round(pct * 100)}%)`
  progress(0, total, 'Menyiapkan mesin OCR (sekitar 10 MB, hanya sekali)')
  const worker = await createWorker(lang, 1, {
    workerPath: `${origin}/tesseract/worker.min.js`,
    corePath: `${origin}/tesseract`,
    langPath: `${origin}/tessdata`,
    gzip: false,
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text') {
        pct = m.progress
        progress(page, total, label())
      }
    },
  })

  const out: OutputFile[] = []
  try {
    for (const f of inputs) {
      const texts: string[] = []
      const pdfPages: Uint8Array[] = []
      const recognize = async (img: Uint8Array) => {
        pct = 0
        progress(page, total, label())
        const r = await worker.recognize(img, {}, { text: true, pdf: wantPdf })
        texts.push(r.data.text.trim())
        if (wantPdf && r.data.pdf) pdfPages.push(new Uint8Array(r.data.pdf))
        page++
      }

      const doc = docs.get(f.name)
      if (doc) {
        for (let n = 1; n <= doc.numPages; n++) {
          const pg = await doc.getPage(n)
          const vp = pg.getViewport({ scale: DPI / 72 })
          const canvas = new OffscreenCanvas(Math.ceil(vp.width), Math.ceil(vp.height))
          const ctx = canvas.getContext('2d')!
          ctx.fillStyle = '#fff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          await pg.render({ canvas: canvas as unknown as HTMLCanvasElement, viewport: vp }).promise
          const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 })
          pg.cleanup()
          await recognize(new Uint8Array(await blob.arrayBuffer()))
        }
        await doc.loadingTask.destroy()
      } else {
        const type = mimeOf(f.name)
        const img = type === 'image/webp' ? await webpToPng(new Blob([f.data.slice()], { type })) : f.data
        await recognize(img)
      }

      if (wantPdf) {
        const merged = await PDFDocument.create()
        for (const bytes of pdfPages) {
          const src = await PDFDocument.load(bytes)
          for (const p of await merged.copyPages(src, src.getPageIndices())) merged.addPage(p)
        }
        out.push({ name: `${baseName(f.name)}-ocr.pdf`, data: await merged.save(), type: 'application/pdf' })
      } else {
        const body = texts.length > 1 ? texts.map((t, i) => `--- Halaman ${i + 1} ---\n${t}`).join('\n\n') : (texts[0] ?? '')
        out.push({ name: `${baseName(f.name)}.txt`, data: new TextEncoder().encode(body + '\n'), type: 'text/plain' })
      }
    }
  } finally {
    await worker.terminate()
  }
  progress(total, total, 'Selesai')
  return out
}
