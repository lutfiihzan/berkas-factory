// Uji privasi "nol upload" (PRD 11): tidak ada request keluar origin / non-GET / berbody saat tool dipakai.
import { chromium } from 'playwright-core'
import { PDFDocument } from 'pdf-lib'
import { PDFDocument as CantooDoc } from '@cantoo/pdf-lib'
import { existsSync, readFileSync } from 'node:fs'
import zlib from 'node:zlib'

const BASE = (process.env.BASE_URL || 'http://localhost:5173').replace(/\/$/, '')
const ORIGIN = new URL(BASE).origin
const PW = 'uji12345'
const CANDIDATES = [
'C:/Program Files/Google/Chrome/Application/chrome.exe',  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
]

async function makePdf(pages = 3) {
  const d = await PDFDocument.create()
  for (let i = 1; i <= pages; i++) d.addPage([300, 400]).drawText(`Halaman ${i}`, { x: 50, y: 200 })
  return Buffer.from(await d.save())
}
async function makeEncrypted() {
  const d = await CantooDoc.create()
  d.addPage([300, 400]).drawText('Rahasia', { x: 50, y: 200 })
  d.encrypt({ userPassword: PW, ownerPassword: PW + 'x' })
  return Buffer.from(await d.save())
}
// PNG 64x64 RGB valid, dibuat di memori (CRC32 + zlib bawaan Node)
const PNG = (() => {
  const W = 64, H = 64
  const raw = Buffer.alloc((W * 3 + 1) * H)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const o = y * (W * 3 + 1)
    raw[o + 1 + x * 3] = x * 4; raw[o + 2 + x * 3] = y * 4; raw[o + 3 + x * 3] = 128
  }
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
  const crc = (b) => { let c = 0xffffffff; for (const v of b) c = crcTable[(c ^ v) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
  const chunk = (type, data) => {
    const t = Buffer.concat([Buffer.from(type), data])
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const c = Buffer.alloc(4); c.writeUInt32BE(crc(t))
    return Buffer.concat([len, t, c])
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
})()

const pdf = (name = 'uji.pdf', buf) => ({ name, mimeType: 'application/pdf', buffer: buf })
const png = (name = 'uji.png') => ({ name, mimeType: 'image/png', buffer: PNG })

async function fillText(page, value) {
  const el = page.locator('input[type=text], input:not([type])').first()
  await el.fill(value)
}

async function buildTools() {
  const base = await makePdf(3)
  const enc = await makeEncrypted()
  return [
    { slug: 'gabung-pdf', files: [pdf('a.pdf', base), pdf('b.pdf', base)] },
    { slug: 'pisah-pdf', files: [pdf('a.pdf', base)], setup: (p) => fillText(p, '1-2') },
    { slug: 'putar-pdf', files: [pdf('a.pdf', base)] },
    { slug: 'atur-halaman-pdf', files: [pdf('a.pdf', base)], setup: (p) => fillText(p, '3,1') },
    { slug: 'kompres-pdf', files: [pdf('a.pdf', base)] },
    { slug: 'pdf-ke-jpg', files: [pdf('a.pdf', base)] },
    { slug: 'jpg-ke-pdf', files: [png()] },
    { slug: 'watermark-pdf', files: [pdf('a.pdf', base)], setup: async (p) => {
      const el = p.locator('input[type=text], input:not([type])').first()
      if (!(await el.inputValue())) await el.fill('RAHASIA')
    } },
    { slug: 'nomor-halaman-pdf', files: [pdf('a.pdf', base)] },
    { slug: 'perbaiki-file', files: [pdf('a.pdf', base)] },
    { slug: 'kompres-gambar', files: [png()] },
    { slug: 'ocr', files: [png()] },
    { slug: 'hapus-background', files: [png()] },
    { slug: 'kunci-pdf', files: [pdf('a.pdf', base)], setup: async (p) => {
      const pw = p.locator('input[type=password]')
      await pw.nth(0).fill(PW); await pw.nth(1).fill(PW)
    } },
    { slug: 'buka-kunci-pdf', files: [pdf('enc.pdf', enc)], setup: (p) => p.locator('input[type=password]').first().fill(PW) },
  ]
}

const browserPath = CANDIDATES.find(existsSync)
if (!browserPath) { console.error('Chrome/Edge tidak ditemukan.'); process.exit(2) }

const browser = await chromium.launch({ executablePath: browserPath, headless: true })
const results = []
for (const t of await buildTools()) {
  const ctx = await browser.newContext({ acceptDownloads: true })
  // Pengunjung yang sudah memilih di banner cookie ('essential' = tanpa cache offline), agar banner tidak menutupi tombol
  await ctx.addInitScript(() => { try { localStorage.setItem('bf-consent', 'essential') } catch {} })
  const page = await ctx.newPage()
  const violations = []
  const consoleErrors = []
  page.on('request', (req) => {
    const u = req.url()
    if (u.startsWith('data:') || u.startsWith('blob:')) return
    const why = []
    let origin = ''
    try { origin = new URL(u).origin } catch { origin = u }
    if (origin !== ORIGIN) why.push('origin asing')
    if (!['GET', 'HEAD'].includes(req.method())) why.push(`method ${req.method()}`)
    if (req.postData()) why.push('postData')
    if (why.length) violations.push(`${req.method()} ${u} [${why.join(', ')}]`)
  })
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)) })
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + String(e.message).slice(0, 200)))
  let note = ''
  try {
    await page.goto(`${BASE}/${t.slug}`, { waitUntil: 'networkidle' })
    await page.locator('input[type=file]:not([webkitdirectory])').first().setInputFiles(t.files)
    await page.waitForTimeout(500)
    if (t.setup) await t.setup(page)
    const btn = page.locator('[data-testid=run]:not([disabled])').first()
    await btn.click({ timeout: 10000 })
    const outcome = await Promise.race([
      page.getByText('Beres.').first().waitFor({ timeout: 60000 }).then(() => 'ok'),
      page.locator('[role=alert], .text-red-600, .text-red-700, .text-red-800').first().waitFor({ timeout: 60000 }).then(() => 'error'),
    ])
    if (outcome === 'error') note = 'tool menampilkan error: ' + (await page.locator('[role=alert], .text-red-600, .text-red-700, .text-red-800').first().innerText()).slice(0, 120)
    await page.waitForTimeout(300)
  } catch (e) {
    note = 'alur gagal: ' + String(e.message).split('\n')[0].slice(0, 140)
  }
  const flowOk = !note
  const pass = violations.length === 0 && consoleErrors.length === 0 && flowOk
  results.push({ slug: t.slug, pass, violations, consoleErrors, note, flowOk })
  await ctx.close()
}
await browser.close()

// Pengecekan statis CSP
let cspOk = true, cspMsg = ''
{
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const m = html.match(/http-equiv=["']Content-Security-Policy["'][^>]*content="([^"]*)"/i)
  if (!m) { cspOk = false; cspMsg = 'meta CSP tidak ada' }
  else if (!m[1].includes("connect-src 'self'")) { cspOk = false; cspMsg = "tidak ada connect-src 'self'" }
  else if (/https?:\/\//i.test(m[1])) { cspOk = false; cspMsg = 'CSP memuat domain eksternal' }
}

console.log(`\nBrowser: ${browserPath}\nBase: ${BASE}\n`)
console.log('TOOL'.padEnd(22) + 'HASIL  KETERANGAN')
for (const r of results) {
  const info = [r.note, r.violations.length && `${r.violations.length} request pelanggar`, r.consoleErrors.length && `${r.consoleErrors.length} error konsol`].filter(Boolean).join('; ')
  console.log(r.slug.padEnd(22) + (r.pass ? 'PASS   ' : 'FAIL   ') + info)
}
console.log('index.html CSP'.padEnd(22) + (cspOk ? 'PASS' : 'FAIL   ' + cspMsg))
for (const r of results) {
  r.violations.forEach((v) => console.log(`  [pelanggaran] ${r.slug}: ${v}`))
  r.consoleErrors.forEach((v) => console.log(`  [konsol] ${r.slug}: ${v}`))
}
process.exit(results.every((r) => r.pass) && cspOk ? 0 : 1)
