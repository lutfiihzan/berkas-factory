import { useState } from 'react'
import { Link } from 'react-router-dom'

export function Bulk() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-12">
      <div className="flex flex-col items-start gap-4 rounded-3xl bg-white p-6 shadow-card sm:flex-row sm:items-center sm:p-8">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white" aria-hidden>
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="8" y="3" width="12" height="14" rx="2" />
            <path d="M4 7v12a2 2 0 002 2h10" />
          </svg>
        </span>
        <div>
          <h2 className="text-xl font-bold text-navy-900">Banyak file sekaligus</h2>
          <p className="mt-1 text-navy-700">
            Punya satu folder penuh? Masukkan semuanya, atur antreannya, lalu biarkan browsermu mengerjakan satu per satu. Tetap di perangkatmu.
          </p>
        </div>
      </div>
    </section>
  )
}

export function Kitchen() {
  const [ok, setOk] = useState(() => {
    try { return localStorage.getItem('notify') === '1' } catch { return false }
  })
  const mark = () => {
    try { localStorage.setItem('notify', '1') } catch { /* abaikan */ }
    setOk(true)
  }
  return (
    <section className="bg-navy-50 px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border-2 border-dashed border-navy-300 p-6 text-center sm:p-10">
        <h2 className="text-3xl font-bold tracking-tight text-navy-900">Masih di dapur</h2>
        <p className="mx-auto mt-3 max-w-2xl text-navy-700">
          Daftar tool-nya bakal nambah terus. Yang lagi dikerjain: <strong>Repair file</strong> (PDF yang nggak mau kebuka, kita coba selamatkan), <strong>Hapus background</strong> foto, dan alat-alat gambar lain. Semuanya tetap jalan di browser.
        </p>
        <button
          onClick={mark}
          disabled={ok}
          className="mt-6 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600 disabled:bg-navy-200 disabled:text-navy-700"
        >
          {ok ? 'Oke, dicatat di perangkatmu' : 'Kabari aku'}
        </button>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="bg-navy-950 py-10 text-center text-sm text-navy-300">
      <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        <Link to="/privasi" className="hover:text-white hover:underline">Privasi</Link>
        <Link to="/tentang" className="hover:text-white hover:underline">Tentang</Link>
        <a href="/#cara-kerja" className="hover:text-white hover:underline">Cara kerja</a>
        <a href="/#faq" className="hover:text-white hover:underline">FAQ</a>
        <button onClick={() => window.dispatchEvent(new Event('open-feedback'))} className="hover:text-white hover:underline">Kasih masukan</button>
      </nav>
      <p className="mt-5">Dibuat supaya filemu tetap milikmu.</p>
      <p className="mt-1 text-navy-400">BerkasFactory &middot; {new Date().getFullYear()}</p>
    </footer>
  )
}
