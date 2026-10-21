// Membaca slug dari src/tools/*/manifest.ts, menulis public/sitemap.xml.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'

// Samakan dengan SITE_URL di src/lib/seo.ts.
const SITE = 'https://tools.senikode.com'

const urls = ['/']
for (const d of readdirSync('src/tools', { withFileTypes: true })) {
  if (!d.isDirectory()) continue
  let src
  try { src = readFileSync(`src/tools/${d.name}/manifest.ts`, 'utf8') } catch { continue }
  const slug = src.match(/slug:\s*['"]([^'"]+)['"]/)?.[1]
  const status = src.match(/status:\s*['"]([^'"]+)['"]/)?.[1]
  if (slug && status !== 'coming-soon') urls.push('/' + slug)
}
const body = urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')
writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`)
console.log(`sitemap: ${urls.length} url`)
