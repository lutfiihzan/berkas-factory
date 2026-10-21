// Salin aset runtime OCR (worker + core WASM tesseract) ke public/tesseract/ supaya self-hosted.
import { copyFileSync, mkdirSync, existsSync } from 'node:fs'

const out = 'public/tesseract'
mkdirSync(out, { recursive: true })
const files = [
  ['node_modules/tesseract.js/dist/worker.min.js', 'worker.min.js'],
  ...['tesseract-core-lstm', 'tesseract-core-simd-lstm', 'tesseract-core-relaxedsimd-lstm'].map((n) => [
    `node_modules/tesseract.js-core/${n}.wasm.js`,
    `${n}.wasm.js`,
  ]),
]
for (const [src, name] of files) {
  if (!existsSync(src)) throw new Error(`Tidak ada: ${src}`)
  copyFileSync(src, `${out}/${name}`)
  console.log('disalin', name)
}
