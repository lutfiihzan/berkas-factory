import type { OutputFile, RunFn } from '../../registry/types'

interface Opts {
  level?: 'ringan' | 'sedang' | 'kuat'
  maxSide?: number
  format?: 'same' | 'jpg' | 'webp'
}
const Q = { ringan: 0.85, sedang: 0.7, kuat: 0.5 }
type Kind = 'png' | 'jpg' | 'webp'
const MIME: Record<Kind, string> = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' }

function sniff(d: Uint8Array): Kind | null {
  if (d[0] === 0x89 && d[1] === 0x50) return 'png'
  if (d[0] === 0xff && d[1] === 0xd8) return 'jpg'
  if (d[0] === 0x52 && d[1] === 0x49 && d[8] === 0x57 && d[9] === 0x45) return 'webp'
  return null
}

function hasAlpha(ctx: OffscreenCanvasRenderingContext2D, w: number, h: number) {
  const px = ctx.getImageData(0, 0, w, h).data
  for (let i = 3; i < px.length; i += 4) if (px[i] < 255) return true
  return false
}

export const run: RunFn<Opts> = async (inputs, options, { progress }) => {
  const q = Q[options?.level ?? 'sedang']
  const maxSide = options?.maxSide ?? 0
  const fmt = options?.format ?? 'same'
  const out: OutputFile[] = []
  for (let i = 0; i < inputs.length; i++) {
    const f = inputs[i]
    progress(i, inputs.length, `Mengompres ${f.name}`)
    const kind = sniff(f.data)
    if (!kind) throw new Error(`${f.name}: format tidak dikenali (hanya JPG, PNG, WebP).`)
    const bmp = await createImageBitmap(new Blob([f.data as BlobPart], { type: MIME[kind] }))
    let w = bmp.width
    let h = bmp.height
    const long = Math.max(w, h)
    if (maxSide > 0 && long > maxSide) {
      w = Math.max(1, Math.round((w * maxSide) / long))
      h = Math.max(1, Math.round((h * maxSide) / long))
    }
    const canvas = new OffscreenCanvas(w, h)
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    ctx.drawImage(bmp, 0, 0, w, h)
    bmp.close()

    const target: Kind = fmt === 'same' ? kind : fmt
    if (target === 'jpg' && kind !== 'jpg' && hasAlpha(ctx, w, h)) {
      // JPG tidak punya transparansi: isi latar putih
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'
    }
    const blob = await canvas.convertToBlob({ type: MIME[target], quality: q })
    const data = new Uint8Array(await blob.arrayBuffer())
    if (data.byteLength >= f.data.byteLength || blob.type !== MIME[target]) {
      progress(i + 1, inputs.length, `${f.name}: sudah sekecil mungkin, file asli dikembalikan`)
      out.push({ name: f.name, data: f.data, type: MIME[kind] })
    } else {
      const base = f.name.replace(/\.[^.]+$/, '')
      out.push({ name: `${base}-kecil.${target}`, data, type: MIME[target] })
    }
  }
  return out
}
