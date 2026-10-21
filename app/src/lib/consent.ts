// Persetujuan penyimpanan di perangkat. BerkasFactory tidak memakai cookie pelacak maupun iklan.
//  - 'essential': hanya yang perlu (batas kirim masukan). Tidak ada cache offline.
//  - 'all': juga cache offline lewat service worker.
export type Consent = 'all' | 'essential'

const KEY = 'bf-consent'
let memory: Consent | null = null

export function getConsent(): Consent | null {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'all' || v === 'essential') return v
  } catch {
    /* penyimpanan diblokir */
  }
  return memory
}

async function registerSW() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  try {
    await navigator.serviceWorker.register('/sw.js')
  } catch {
    /* ditolak/tidak didukung: aplikasi tetap jalan online */
  }
}

async function removeOffline() {
  if (!('serviceWorker' in navigator)) return
  try {
    const regs = await navigator.serviceWorker.getRegistrations()
    await Promise.all(regs.map((r) => r.unregister()))
    if ('caches' in window) await Promise.all((await caches.keys()).map((k) => caches.delete(k)))
  } catch {
    /* abaikan */
  }
}

export function setConsent(c: Consent) {
  memory = c
  try {
    localStorage.setItem(KEY, c)
  } catch {
    /* abaikan */
  }
  void (c === 'all' ? registerSW() : removeOffline())
  window.dispatchEvent(new Event('consent-changed'))
}

/** Dipanggil saat aplikasi mulai: aktifkan cache offline hanya bila pengguna sudah setuju. */
export function applyConsent() {
  if (getConsent() === 'all') window.addEventListener('load', () => void registerSW())
}
