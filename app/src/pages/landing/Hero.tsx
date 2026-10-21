import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { tools } from '../../registry'

const chips = ['Tanpa upload', 'Tanpa akun', 'Tanpa watermark', 'Bisa offline']

function Check() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-accent-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="10" cy="10" r="8.5" strokeWidth="1.5" className="opacity-50" />
      <path d="M6 10.3l2.8 2.8L14 7.6" />
    </svg>
  )
}

export default function Hero() {
  const nav = useNavigate()
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [picked, setPicked] = useState<File[] | null>(null)

  const live = tools.filter((t) => t.status !== 'coming-soon')
  const isImage = (f: File) => f.type.startsWith('image/')
  const isPdfFile = (f: File) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name)

  const handleFiles = (files: File[]) => {
    if (!files.length) return
    if (files.every(isImage)) {
      const t = live.find((x) => x.slug === 'jpg-ke-pdf')
      if (t) {
        nav('/' + t.slug, { state: { files } })
        return
      }
    }
    setPicked(files)
  }

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const tgt = e.target as HTMLElement | null
      if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.isContentEditable)) return
      const files = Array.from(e.clipboardData?.files ?? [])
      if (files.length) {
        e.preventDefault()
        handleFiles(files)
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const kind = picked ? (picked.every(isPdfFile) ? 'pdf' : picked.every(isImage) ? 'image' : 'file') : null
  const options = live.filter((t) => t.category === kind)

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 to-navy-800 px-4 pb-14 pt-12 text-center sm:pb-20 sm:pt-16">
      <svg className="pointer-events-none absolute inset-0 h-full w-full text-navy-600 opacity-25" aria-hidden>
        <defs>
          <pattern id="hero-dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dots)" />
      </svg>
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-500 opacity-20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-navy-500 opacity-30 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-5xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">Filemu nggak ke mana-mana.</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-200">
          Gabung, kompres, ubah, hapus background. Semuanya jalan di browsermu sendiri, jadi filenya tidak pernah menyentuh server kami.
        </p>

        <div
          onDragOver={(e) => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); handleFiles(Array.from(e.dataTransfer.files)) }}
          className={
            'mx-auto mt-9 max-w-2xl rounded-3xl border-2 border-dashed p-6 backdrop-blur-sm transition-colors sm:p-12 ' +
            (over ? 'border-white bg-white/20' : 'border-white/40 bg-white/10')
          }
        >
          <svg viewBox="0 0 48 48" className="mx-auto h-12 w-12 text-navy-200" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M24 32V10M15 19l9-9 9 9" />
            <path d="M8 30v6a4 4 0 004 4h24a4 4 0 004-4v-6" />
          </svg>
          <button
            onClick={() => input.current?.click()}
            className="mt-4 rounded-xl bg-brand-500 px-8 py-3.5 text-lg font-semibold text-white shadow-card transition hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Pilih file
          </button>
          <p className="mt-3 text-navy-200">atau tarik file ke sini</p>
          <p className="mt-1 text-sm text-navy-300">PDF, gambar, dan lainnya. Bisa juga tempel dengan Ctrl+V.</p>
          <input ref={input} type="file" multiple hidden onChange={(e) => { handleFiles(Array.from(e.target.files ?? [])); e.target.value = '' }} />
          {picked && (
            <div className="mt-6 border-t border-white/20 pt-4 text-left" aria-live="polite">
              <p className="text-sm font-medium text-white">{picked.length} file dipilih. Mau diapakan?</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {options.length ? (
                  options.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => nav('/' + t.slug, { state: { files: picked } })}
                      className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-navy-900 hover:bg-navy-100"
                    >
                      {t.name}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-navy-200">Belum ada tool yang cocok untuk jenis file ini. Cek daftar tool di bawah.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-sm text-navy-300">Tidak perlu daftar. Tidak ada watermark. Coba matikan wifi, tetap jalan.</p>
        <ul className="mt-5 flex flex-wrap justify-center gap-2">
          {chips.map((c) => (
            <li key={c} className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm text-white">
              <Check />
              {c}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
