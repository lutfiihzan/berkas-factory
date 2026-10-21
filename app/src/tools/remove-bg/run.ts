import * as ort from 'onnxruntime-web/wasm'
// loader .mjs lewat Vite (?url): file di public/ tidak boleh di-import dinamis saat dev; wasm tetap self-hosted di /ort/
import ortMjs from '../../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs?url'
import type { OutputFile, RunFn } from '../../registry/types'

interface Opts {
  bg?: 'transparent' | 'white' | 'color'
  color?: string
  smooth?: boolean
}

const REF = 512
let sessionP: Promise<ort.InferenceSession> | null = null

function getSession() {
  if (!sessionP) {
    ort.env.wasm.wasmPaths = { mjs: ortMjs, wasm: '/ort/ort-wasm-simd-threaded.wasm' }
    ort.env.wasm.numThreads = 1
    ort.env.wasm.proxy = false
    sessionP = (async () => {
      const res = await fetch('/models/modnet.onnx') // MODNet penuh; versi kuantisasi 8-bit melubangi area putih datar (blus, kemeja)
      if (!res.ok) throw new Error('Model tidak bisa dimuat.')
      const buf = new Uint8Array(await res.arrayBuffer())
      return ort.InferenceSession.create(buf, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' })
    })()
    sessionP.catch(() => {
      sessionP = null
    })
  }
  return sessionP
}

const m32 = (v: number) => Math.max(32, Math.round(v / 32) * 32)

function sniffMime(d: Uint8Array) {
  if (d[0] === 0x89 && d[1] === 0x50) return 'image/png'
  if (d[0] === 0xff && d[1] === 0xd8) return 'image/jpeg'
  if (d[0] === 0x52 && d[1] === 0x49 && d[8] === 0x57 && d[9] === 0x45) return 'image/webp'
  return null
}

export const run: RunFn<Opts> = async (inputs, options, { progress }) => {
  const bg = options?.bg ?? 'transparent'
  const smooth = options?.smooth ?? true
  progress(0, inputs.length, 'Menyiapkan model (sekitar 40 MB total, hanya sekali)')
  const session = await getSession()
  const inName = session.inputNames[0]
  const outName = session.outputNames[0]
  const out: OutputFile[] = []

  for (let i = 0; i < inputs.length; i++) {
    const f = inputs[i]
    progress(i, inputs.length, `Memproses ${f.name}`)
    const mime = sniffMime(f.data)
    if (!mime) throw new Error(`${f.name}: format tidak dikenali (hanya JPG, PNG, WebP).`)
    const bmp = await createImageBitmap(new Blob([f.data as BlobPart], { type: mime }))
    const W = bmp.width
    const H = bmp.height

    // ukuran input model: sisi pendek ~512, kelipatan 32, sisi panjang dibatasi
    let s = REF / Math.min(W, H)
    if (Math.max(W, H) * s > 1280) s = 1280 / Math.max(W, H)
    const iw = m32(W * s)
    const ih = m32(H * s)
    const small = new OffscreenCanvas(iw, ih)
    const sctx = small.getContext('2d', { willReadFrequently: true })!
    sctx.drawImage(bmp, 0, 0, iw, ih)
    const px = sctx.getImageData(0, 0, iw, ih).data
    const plane = iw * ih
    const data = new Float32Array(3 * plane)
    for (let p = 0; p < plane; p++) {
      data[p] = (px[p * 4] / 255 - 0.5) / 0.5
      data[plane + p] = (px[p * 4 + 1] / 255 - 0.5) / 0.5
      data[2 * plane + p] = (px[p * 4 + 2] / 255 - 0.5) / 0.5
    }
    const res = await session.run({ [inName]: new ort.Tensor('float32', data, [1, 3, ih, iw]) })
    const matte = res[outName].data as Float32Array

    // matte -> kanvas abu-abu, lalu diskalakan bilinear ke ukuran asli
    const mc = new OffscreenCanvas(iw, ih)
    const mctx = mc.getContext('2d')!
    const mimg = mctx.createImageData(iw, ih)
    for (let p = 0; p < plane; p++) {
      const v = Math.max(0, Math.min(1, matte[p])) * 255
      mimg.data[p * 4] = mimg.data[p * 4 + 1] = mimg.data[p * 4 + 2] = v
      mimg.data[p * 4 + 3] = 255
    }
    mctx.putImageData(mimg, 0, 0)
    const full = new OffscreenCanvas(W, H)
    const fctx = full.getContext('2d', { willReadFrequently: true })!
    fctx.imageSmoothingEnabled = true
    fctx.imageSmoothingQuality = 'high'
    if (smooth) fctx.filter = `blur(${Math.max(0.8, Math.min(W, H) / 400).toFixed(2)}px)`
    fctx.drawImage(mc, 0, 0, W, H)
    fctx.filter = 'none'
    const alpha = fctx.getImageData(0, 0, W, H).data

    // gambar asli + alpha dari matte
    const oc = new OffscreenCanvas(W, H)
    const octx = oc.getContext('2d', { willReadFrequently: true })!
    octx.drawImage(bmp, 0, 0)
    bmp.close()
    const img = octx.getImageData(0, 0, W, H)
    const d = img.data
    for (let p = 0; p < W * H; p++) {
      let a = alpha[p * 4] / 255
      if (smooth) a = a * a * (3 - 2 * a) // smoothstep: tepi lebih tegas tapi tetap lembut
      d[p * 4 + 3] = Math.round(a * d[p * 4 + 3])
    }
    octx.putImageData(img, 0, 0)

    let final = oc
    if (bg !== 'transparent') {
      final = new OffscreenCanvas(W, H)
      const c = final.getContext('2d')!
      const col = options?.color ?? ''
      c.fillStyle = bg === 'color' && /^#[0-9a-f]{6}$/i.test(col) ? col : '#ffffff'
      c.fillRect(0, 0, W, H)
      c.drawImage(oc, 0, 0)
    }
    const blob = await final.convertToBlob({ type: 'image/png' })
    const base = f.name.replace(/\.[^.]+$/, '')
    out.push({ name: `${base}-tanpa-bg.png`, data: new Uint8Array(await blob.arrayBuffer()), type: 'image/png' })
    progress(i + 1, inputs.length, `Selesai ${f.name}`)
  }
  return out
}
