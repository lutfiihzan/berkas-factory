import type { ReactNode } from 'react'

const ic = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className: 'h-7 w-7' } as const
const steps: { text: string; icon: ReactNode }[] = [
  { text: 'Kamu pilih file', icon: <svg {...ic}><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" /><path d="M14 3v5h5" /></svg> },
  { text: 'Browsermu yang kerja', icon: <svg {...ic}><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M8 21h8M12 18v3" /></svg> },
  { text: 'Kamu unduh hasilnya', icon: <svg {...ic}><path d="M12 4v11M7 11l5 5 5-5" /><path d="M5 20h14" /></svg> },
]
const rows: [string, string, string][] = [
  ['File dikirim ke server', 'Tidak', 'Ya'],
  ['Perlu akun', 'Tidak', 'Sering'],
  ['Batas tugas per hari', 'Tidak ada', 'Sering ada'],
  ['Watermark di hasil gratis', 'Tidak', 'Kadang'],
  ['Jalan tanpa internet', 'Ya, setelah halaman pertama dimuat', 'Tidak'],
  ['Kecepatan untuk file besar', 'Tergantung perangkatmu, tanpa waktu upload', 'Tergantung koneksi'],
]

const Yes = () => (
  <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 10.5l4 4 8-9" /></svg>
)
const No = () => (
  <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden><path d="M5 5l10 10M15 5L5 15" /></svg>
)

export default function Explain() {
  return (
    <>
      <section id="cara-kerja" className="scroll-mt-16 bg-white px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight text-navy-900">Kok bisa tanpa upload?</h2>
          <p className="mt-3 max-w-2xl text-navy-700">
            Browser zaman sekarang sudah cukup kuat buat ngerjain PDF sendiri. Waktu kamu pilih file, file itu dibaca langsung dari laptop atau HP-mu, diproses di tab ini, lalu hasilnya kamu unduh. Server kami cuma menyajikan halaman web ini. Kami tidak punya tempat buat menyimpan filemu, bahkan kalau mau.
          </p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.text} className="rounded-2xl bg-navy-50 p-5">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white" aria-hidden>{s.icon}</span>
                <span className="mt-4 block text-sm font-medium text-navy-500">Langkah {i + 1}</span>
                <p className="font-bold text-navy-900">{s.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-navy-600">Tidak ada panah ke server.</p>
        </div>
      </section>

      <section className="bg-navy-900 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight text-white">Jangan percaya begitu saja. Cek.</h2>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              'Buka halaman ini, tunggu sampai selesai dimuat.',
              'Matikan wifi atau nyalakan mode pesawat.',
              'Gabung dua PDF. Berhasil? Berarti memang tidak ada yang dikirim ke mana-mana.',
              'Penasaran lebih jauh? Buka DevTools, tab Network, lalu proses file. Tidak ada request yang membawa filemu.',
            ].map((t, i) => (
              <li key={t} className="flex gap-4 rounded-2xl bg-white/10 p-5 text-navy-100">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-400 font-bold text-navy-900">{i + 1}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-navy-900">Bedanya apa sama tool online lain?</h2>
          <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-card">
            <div className="hidden grid-cols-[1.2fr_1.4fr_1fr] gap-4 bg-navy-900 px-6 py-3 text-sm font-semibold text-white sm:grid">
              <span className="sr-only">Hal</span>
              <span className="col-start-2">BerkasFactory</span>
              <span>Tool online biasa</span>
            </div>
            <ul className="divide-y divide-navy-100">
              {rows.map(([a, b, c]) => (
                <li key={a} className="grid gap-2 px-5 py-4 text-sm sm:grid-cols-[1.2fr_1.4fr_1fr] sm:gap-4 sm:px-6">
                  <span className="font-semibold text-navy-900">{a}</span>
                  <span className="flex gap-2 font-medium text-navy-900">
                    <Yes />
                    <span><span className="text-xs font-normal text-navy-500 sm:hidden">BerkasFactory: </span>{b}</span>
                  </span>
                  <span className="flex gap-2 text-navy-600">
                    <No />
                    <span><span className="text-xs text-navy-500 sm:hidden">Tool biasa: </span>{c}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
