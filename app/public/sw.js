// Service worker BerkasFactory: offline setelah kunjungan pertama.
const VERSION = 'v3'
const SHELL = `bf-shell-${VERSION}`
const RUNTIME = `bf-runtime-${VERSION}`
const PRECACHE = ['/', '/index.html', '/favicon.svg', '/icon.svg', '/manifest.webmanifest']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL && k !== RUNTIME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

async function cacheFirst(req) {
  const cache = await caches.open(RUNTIME)
  const hit = await cache.match(req)
  if (hit) return hit
  const res = await fetch(req)
  if (res.ok) cache.put(req, res.clone())
  return res
}

async function networkFirstNav(req) {
  const cache = await caches.open(SHELL)
  try {
    const res = await fetch(req)
    if (res.ok) cache.put('/index.html', res.clone())
    return res
  } catch {
    return (await cache.match('/index.html')) || (await cache.match('/')) || Response.error()
  }
}

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== location.origin) return
  if (req.mode === 'navigate') return e.respondWith(networkFirstNav(req))
  // aset ber-hash (chunk tool, pdf.worker, wasm, font) dan ikon/manifest
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/tesseract/') || /\.(svg|webmanifest|wasm|onnx|traineddata)$/.test(url.pathname)) {
    return e.respondWith(cacheFirst(req))
  }
})
