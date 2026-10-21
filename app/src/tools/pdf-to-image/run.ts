import { pdfjs } from '../../lib/pdfjs'
import type { OutputFile, RunFn } from '../../registry/types'

export const run: RunFn<{ format?: 'jpg' | 'png'; dpi?: number }> = async (inputs, options, { progress }) => {
  const png = options?.format === 'png'
  const scale = (options?.dpi ?? 150) / 72
  const out: OutputFile[] = []
  for (const f of inputs) {
    const base = f.name.replace(/\.pdf$/i, '')
    const doc = await pdfjs.getDocument({ data: f.data }).promise
    for (let n = 1; n <= doc.numPages; n++) {
      progress(n - 1, doc.numPages, `Merender ${f.name}`)
      const page = await doc.getPage(n)
      const vp = page.getViewport({ scale })
      const canvas = new OffscreenCanvas(Math.ceil(vp.width), Math.ceil(vp.height))
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      await page.render({ canvas: canvas as unknown as HTMLCanvasElement, viewport: vp }).promise
      const type = png ? 'image/png' : 'image/jpeg'
      const blob = await canvas.convertToBlob(png ? { type } : { type, quality: 0.92 })
      out.push({ name: `${base}-hal-${n}.${png ? 'png' : 'jpg'}`, data: new Uint8Array(await blob.arrayBuffer()), type })
      page.cleanup()
    }
    await doc.loadingTask.destroy()
  }
  return out
}
