import { PDFDocument } from 'pdf-lib'
import type { PDFImage } from 'pdf-lib'
import type { RunFn } from '../../registry/types'

interface Opts {
  size: 'fit' | 'a4' | 'letter'
  orientation: 'auto' | 'portrait' | 'landscape'
  margin: 'none' | 'small' | 'medium'
}

const SIZES = { a4: [595.28, 841.89], letter: [612, 792] } as const
const MARGINS = { none: 0, small: 18, medium: 36 } as const

async function embed(doc: PDFDocument, data: Uint8Array): Promise<PDFImage> {
  if (data[0] === 0xff && data[1] === 0xd8) return doc.embedJpg(data)
  if (data[0] === 0x89 && data[1] === 0x50) return doc.embedPng(data)
  // format lain (mis. webp): ubah ke PNG
  const bmp = await createImageBitmap(new Blob([data as BlobPart]))
  const canvas = new OffscreenCanvas(bmp.width, bmp.height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Gambar tidak bisa dibaca.')
  ctx.drawImage(bmp, 0, 0)
  bmp.close()
  const blob = await canvas.convertToBlob({ type: 'image/png' })
  return doc.embedPng(new Uint8Array(await blob.arrayBuffer()))
}

export const run: RunFn<Opts> = async (inputs, opts, { progress }) => {
  const o = opts
  const doc = await PDFDocument.create()
  const m = MARGINS[o.margin]
  for (let i = 0; i < inputs.length; i++) {
    progress(i, inputs.length, 'Memasukkan gambar')
    const img = await embed(doc, inputs[i].data)
    let pw: number
    let ph: number
    if (o.size === 'fit') {
      pw = img.width + m * 2
      ph = img.height + m * 2
    } else {
      const [bw, bh] = SIZES[o.size]
      const landscape = o.orientation === 'auto' ? img.width > img.height : o.orientation === 'landscape'
      pw = landscape ? bh : bw
      ph = landscape ? bw : bh
    }
    const page = doc.addPage([pw, ph])
    const s = Math.min((pw - m * 2) / img.width, (ph - m * 2) / img.height)
    const w = img.width * s
    const h = img.height * s
    page.drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h })
  }
  progress(inputs.length, inputs.length, 'Memasukkan gambar')
  return [{ name: 'gambar.pdf', data: await doc.save(), type: 'application/pdf' }]
}
