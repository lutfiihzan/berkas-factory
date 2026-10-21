// Coba Hapus Background pada foto sungguhan, lalu simpan hasilnya.
// Pakai: node e2e/try-remove-bg.mjs <foto> [folder-keluaran]   (dev server harus jalan; BASE_URL default http://localhost:5173)
import { chromium } from 'playwright-core'
import { existsSync, mkdirSync } from 'node:fs'
import { basename, resolve } from 'node:path'

const BASE = process.env.BASE_URL || 'http://localhost:5173'
const src = process.argv[2]
const outDir = resolve(process.argv[3] || 'e2e/out')
if (!src || !existsSync(src)) {
  console.error('Pakai: node e2e/try-remove-bg.mjs <foto.jpg|png|webp> [folder-keluaran]')
  process.exit(1)
}
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']
  .find(existsSync)
if (!chrome) { console.error('Chrome/Edge tidak ditemukan'); process.exit(1) }

mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch({ executablePath: chrome, headless: true })
const page = await browser.newPage({ acceptDownloads: true })
const outside = []
page.on('request', (r) => { const u = new URL(r.url()); if (!r.url().startsWith('data:') && !r.url().startsWith('blob:') && u.origin !== new URL(BASE).origin) outside.push(r.url()) })

await page.goto(`${BASE}/hapus-background`, { waitUntil: 'networkidle' })
await page.locator('input[type=file]:not([webkitdirectory])').first().setInputFiles(src)
const t0 = Date.now()
await page.locator('[data-testid=run]:not([disabled])').first().click()
await page.getByText('Beres.').waitFor({ timeout: 180_000 })
console.log(`Selesai dalam ${((Date.now() - t0) / 1000).toFixed(1)} detik`)

const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Unduh', exact: true }).first().click()])
const out = resolve(outDir, dl.suggestedFilename() || `${basename(src)}-tanpa-bg.png`)
await dl.saveAs(out)
console.log('Hasil disimpan:', out)
console.log(outside.length ? `PERINGATAN, request ke luar origin: ${outside.join(', ')}` : 'Tidak ada request ke luar origin.')
await browser.close()
