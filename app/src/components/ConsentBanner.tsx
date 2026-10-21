import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getConsent, setConsent } from '../lib/consent'

const CookieIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 12.5A9 9 0 1 1 11.500 3a4.500 4.500 0 0 0 5 4.500 3.500 3.500 0 0 0 4.500 5z" />
    <circle cx="8.500" cy="11" r="1" fill="currentColor" />
    <circle cx="13" cy="15.500" r="1" fill="currentColor" />
    <circle cx="8" cy="15.500" r=".7" fill="currentColor" />
  </svg>
)

/** Banner persetujuan: dibuka otomatis bila belum memilih; bisa dibuka lagi lewat event 'open-consent' (footer). */
export default function ConsentBanner() {
  const [show, setShow] = useState(() => getConsent() === null)

  useEffect(() => {
    const open = () => setShow(true)
    window.addEventListener('open-consent', open)
    return () => window.removeEventListener('open-consent', open)
  }, [])

  if (!show) return null
  const choose = (c: 'all' | 'essential') => {
    setConsent(c)
    setShow(false)
  }
  const current = getConsent()

  return (
    <div
      role="dialog"
      aria-label="Pengaturan cookie dan penyimpanan"
      className="fixed inset-x-3 bottom-3 z-[60] animate-[consent-up_.35s_ease-out] sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-[26rem]"
    >
      <style>{`@keyframes consent-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}`}</style>
      <div className="rounded-3xl bg-navy-900 p-5 text-white shadow-card-hover ring-1 ring-white/10">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-400/15 text-accent-400">
            <CookieIcon />
          </span>
          <div className="min-w-0">
            <h2 className="font-semibold">Soal cookie</h2>
            <p className="mt-1 text-sm leading-relaxed text-navy-200">
              Kami tidak memasang cookie pelacak dan tidak ada iklan. Yang disimpan di perangkatmu cuma hal kecil: batas kirim masukan dan, kalau kamu setuju, cache supaya aplikasi bisa jalan offline. Filemu tidak pernah disimpan.{' '}
              <Link to="/privasi" onClick={() => setShow(false)} className="font-medium text-white underline underline-offset-2 hover:text-accent-400">Detail</Link>
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => choose('all')}
            className="flex-1 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
          >
            Terima
          </button>
          <button
            onClick={() => choose('essential')}
            className="flex-1 rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
          >
            Hanya yang perlu
          </button>
        </div>
        {current && (
          <p className="mt-2 text-center text-xs text-navy-300">
            Pilihan sekarang: {current === 'all' ? 'Terima (cache offline aktif)' : 'Hanya yang perlu'}
          </p>
        )}
      </div>
    </div>
  )
}
