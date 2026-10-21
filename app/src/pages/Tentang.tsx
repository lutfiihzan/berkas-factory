import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const h2 = 'mt-10 text-xl font-bold text-navy-900'
const p = 'mt-3 leading-relaxed text-navy-700'

const libs = [
  ['pdf-lib', 'MIT', 'membuat dan mengubah PDF'],
  ['@cantoo/pdf-lib', 'MIT', 'fork pdf-lib dengan dukungan PDF terenkripsi'],
  ['pdfjs-dist (PDF.js)', 'Apache-2.0', 'membaca dan merender halaman PDF'],
  ['fflate', 'MIT', 'kompresi dan ZIP'],
  ['Comlink', 'Apache-2.0', 'komunikasi dengan Web Worker'],
  ['React', 'MIT', 'antarmuka'],
  ['React Router', 'MIT', 'routing halaman'],
  ['Zustand', 'MIT', 'state aplikasi'],
]

export default function Tentang() {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <main><header className="bg-gradient-to-b from-navy-900 to-navy-800 px-4 py-12 text-center"><div className="mx-auto max-w-3xl"><Link to="/" className="text-sm text-navy-200 hover:text-white hover:underline">&larr; Kembali ke beranda</Link><h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white">Tentang BerkasFactory</h1></div></header><div className="mx-auto max-w-3xl px-4 py-10"><div className="rounded-3xl bg-white p-6 shadow-card sm:p-10">
      <p className={p}>
        BerkasFactory adalah kumpulan alat untuk beresin file (PDF, gambar, dan lainnya) yang seluruhnya jalan di browser. File tidak diunggah ke server mana pun.
      </p>

      <h2 className={h2}>Prinsip</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed text-navy-700">
        <li>Filemu tetap di perangkatmu, dan kamu bisa mengeceknya sendiri. Lihat halaman <Link to="/privasi" className="font-medium text-brand-600 underline">Privasi</Link>.</li>
        <li>Satu tool, satu tugas, tanpa daftar akun.</li>
        <li>Jujur soal keterbatasan, termasuk saat sebuah tool belum bisa menangani suatu file.</li>
      </ul>

      <h2 className={h2}>Pustaka open-source</h2>
      <p className={p}>Terima kasih untuk para pengelolanya. Lisensi di bawah dibaca dari package.json tiap pustaka.</p>
      <ul className="mt-4 divide-y divide-navy-100 overflow-hidden rounded-2xl border border-navy-100">
        {libs.map(([name, lic, use]) => (
          <li key={name} className="flex odd:bg-navy-50 flex-wrap items-baseline justify-between gap-2 px-4 py-2 text-sm">
            <span><strong className="text-navy-900">{name}</strong> <span className="text-navy-600">({use})</span></span>
            <span className="text-navy-600">{lic}</span>
          </li>
        ))}
      </ul>

      <h2 className={h2}>Kontak dan masukan</h2>
      <p className={p}>
        Mau request tool, lapor bug, atau kasih saran? Klik{' '}
        <button onClick={() => window.dispatchEvent(new Event('open-feedback'))} className="font-medium text-brand-600 underline">Kasih masukan</button>
        . Yang terkirim hanya teks yang kamu ketik.
      </p>
    </div></div></main>
  )
}
