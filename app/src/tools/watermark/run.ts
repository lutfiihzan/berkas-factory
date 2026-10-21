import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib'
import type { PDFPage } from 'pdf-lib'
import type { OutputFile, RunFn } from '../../registry/types'

interface Opts {
  text: string
  size: number
  color: string
  opacity: number
  rotation: number
  layout: 'center' | 'tile'
}

function hexToRgb(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  const n = m ? parseInt(m[1], 16) : 0x888888
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}

export const run: RunFn<Opts> = async (inputs, opts, { progress }) => {
  const o = opts
  const text = o.text.trim()
  if (!text) throw new Error('Teks watermark masih kosong.')
  const out: OutputFile[] = []
  for (let i = 0; i < inputs.length; i++) {
    progress(i, inputs.length, 'Memberi watermark')
    const doc = await PDFDocument.load(inputs[i].data)
    const font = await doc.embedFont(StandardFonts.HelveticaBold)
    const tw = font.widthOfTextAtSize(text, o.size)
    const th = o.size * 0.7
    const a = (o.rotation * Math.PI) / 180
    const cos = Math.cos(a)
    const sin = Math.sin(a)
    const color = hexToRgb(o.color)
    // titik awal teks dihitung agar pusat teks jatuh di (cx, cy)
    const draw = (page: PDFPage, cx: number, cy: number) =>
      page.drawText(text, {
        x: cx - (tw / 2) * cos + (th / 2) * sin,
        y: cy - (tw / 2) * sin - (th / 2) * cos,
        size: o.size,
        font,
        color,
        opacity: o.opacity,
        rotate: degrees(o.rotation),
      })
    for (const page of doc.getPages()) {
      const { width, height } = page.getSize()
      if (o.layout === 'center') {
        draw(page, width / 2, height / 2)
      } else {
        const stepX = tw + o.size
        const stepY = o.size * 3
        let row = 0
        for (let y = stepY / 2; y < height + stepY; y += stepY, row++) {
          for (let x = row % 2 ? stepX / 2 : 0; x < width + stepX; x += stepX) draw(page, x, y)
        }
      }
    }
    out.push({
      name: inputs[i].name.replace(/\.pdf$/i, '') + '-watermark.pdf',
      data: await doc.save(),
      type: 'application/pdf',
    })
  }
  progress(inputs.length, inputs.length, 'Memberi watermark')
  return out
}
