// Membuat ikon PNG/ICO dari public/favicon.svg (ikon "any") dan public/icon.svg (full-bleed, untuk maskable dan iOS).
// Jalankan: npm run icons   (memakai playwright-core + Chrome/Edge yang terpasang)
import { chromium } from 'playwright-core'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const pub = resolve(dirname(fileURLToPath(import.meta.url)), '../public')
const any = readFileSync(`${pub}/favicon.svg`, 'utf8')
const full = readFileSync(`${pub}/icon.svg`, 'utf8')
const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find(existsSync)
if (!chrome) throw new Error('Chrome/Edge tidak ditemukan')

const browser = await chromium.launch({ executablePath: chrome })
const page = await browser.newPage()

async function png(svg, size) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`<body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body>`)
  return page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } })
}

writeFileSync(`${pub}/icon-192.png`, await png(any, 192))
writeFileSync(`${pub}/icon-512.png`, await png(any, 512))
writeFileSync(`${pub}/icon-maskable-512.png`, await png(full, 512))
writeFileSync(`${pub}/apple-touch-icon.png`, await png(full, 180))

// favicon.ico berisi PNG 16/32/48
const sizes = [16, 32, 48]
const imgs = await Promise.all(sizes.map((s) => png(any, s)))
const head = Buffer.alloc(6 + 16 * sizes.length)
head.writeUInt16LE(0, 0)
head.writeUInt16LE(1, 2)
head.writeUInt16LE(sizes.length, 4)
let offset = head.length
sizes.forEach((s, i) => {
  const o = 6 + i * 16
  head[o] = s
  head[o + 1] = s
  head.writeUInt16LE(1, o + 4)
  head.writeUInt16LE(32, o + 6)
  head.writeUInt32LE(imgs[i].length, o + 8)
  head.writeUInt32LE(offset, o + 12)
  offset += imgs[i].length
})
writeFileSync(`${pub}/favicon.ico`, Buffer.concat([head, ...imgs]))

await browser.close()
console.log('ikon dibuat di', pub)
