// Salin runtime ONNX Runtime Web (backend wasm) ke public/ort supaya self-hosted.
import { copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'node_modules', 'onnxruntime-web', 'dist')
const dst = join(root, 'public', 'ort')
mkdirSync(dst, { recursive: true })
for (const f of ['ort-wasm-simd-threaded.wasm', 'ort-wasm-simd-threaded.mjs']) {
  if (!existsSync(join(src, f))) throw new Error(`Tidak ketemu: ${f}`)
  copyFileSync(join(src, f), join(dst, f))
  console.log('disalin', f)
}
