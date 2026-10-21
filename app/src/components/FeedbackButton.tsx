import { useEffect, useRef, useState } from 'react'

// Nomor WhatsApp penerima masukan (format internasional tanpa + atau spasi).
const WA_NUMBER = '6285156243769'
const kinds = ['Request tool', 'Lapor bug', 'Saran', 'Lainnya'] as const

// Anti-spam sisi browser (tanpa backend, tanpa captcha pihak ketiga agar CSP tetap ketat):
// jeda antar kirim, batas per jam, minimal/maksimal panjang, jebakan waktu, honeypot, dan slider "geser untuk kirim".
// Catatan: ini menahan pengguna iseng dan bot sederhana; pembatas sungguhan butuh endpoint server (lihat issue #3).
const COOLDOWN_MS = 60_000
const MAX_PER_HOUR = 3
const HOUR_MS = 3_600_000
const MIN_LEN = 10
const MAX_LEN = 600
const MIN_OPEN_MS = 2_500
const STORE = 'bf-feedback'

const readSent = (): number[] => {
  try {
    const v = JSON.parse(localStorage.getItem(STORE) || '[]')
    return Array.isArray(v) ? v.filter((n) => typeof n === 'number') : []
  } catch {
    return []
  }
}
const writeSent = (a: number[]) => {
  try {
    localStorage.setItem(STORE, JSON.stringify(a.slice(-10)))
  } catch {
    /* penyimpanan diblokir: batas hanya berlaku selama tab terbuka */
  }
}

let memorySent: number[] = []
function limits(now: number) {
  const stored = readSent()
  const sent = [...new Set([...stored, ...memorySent])].filter((t) => now - t < HOUR_MS).sort((a, b) => a - b)
  const last = sent[sent.length - 1] ?? 0
  const cooldown = Math.max(0, COOLDOWN_MS - (now - last))
  const hourly = sent.length >= MAX_PER_HOUR ? sent[sent.length - MAX_PER_HOUR] + HOUR_MS - now : 0
  return { sent, wait: Math.max(cooldown, hourly), hourly: hourly > 0 }
}

const fmtWait = (ms: number) => (ms >= 90_000 ? `${Math.ceil(ms / 60_000)} menit` : `${Math.ceil(ms / 1000)} detik`)

const WaGlyph = ({ size = 22 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden fill="currentColor">
    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.2-1.4A9.9 9.9 0 1 0 12.04 2zm0 1.8a8.1 8.1 0 1 1-4.2 15l-.3-.18-3 .8.8-2.9-.2-.3A8.1 8.1 0 0 1 12.04 3.8zm-3 3.6c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.5 1 3 .8 3.5.7.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4l-.5-.3-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.6.1-.3-.2-1.200-.4-2.300-1.400-.8-.8-1.400-1.700-1.500-2-.2-.3 0-.4.100-.6l.4-.5.3-.4v-.5l-.8-2c-.2-.5-.5-.5-.7-.5z" />
  </svg>
)

const field =
  'w-full resize-none rounded-xl border border-navy-200 bg-white p-3 text-sm text-navy-900 outline-none transition placeholder:text-navy-300 focus:border-wa-600 focus:ring-2 focus:ring-wa-500/25'

/** Slider "geser untuk kirim": sekaligus cek manusia sederhana (butuh gerak pointer, bukan satu klik). */
function SlideToSend({ disabled, label, onComplete }: { disabled: boolean; label: string; onComplete: () => void }) {
  const track = useRef<HTMLDivElement>(null)
  const [x, setX] = useState(0)
  const [drag, setDrag] = useState(false)
  const start = useRef({ px: 0, t: 0 })
  const H = 44
  const max = () => Math.max(1, (track.current?.clientWidth ?? 280) - H - 8)

  const finish = () => {
    setX(max())
    onComplete()
    window.setTimeout(() => setX(0), 700)
  }
  const down = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled) return
    e.currentTarget.setPointerCapture(e.pointerId)
    start.current = { px: e.clientX - x, t: performance.now() }
    setDrag(true)
  }
  const move = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (drag) setX(Math.min(max(), Math.max(0, e.clientX - start.current.px)))
  }
  const up = () => {
    if (!drag) return
    setDrag(false)
    if (x >= max() * 0.92 && performance.now() - start.current.t > 250) finish()
    else setX(0)
  }
  const key = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (e.key === 'ArrowRight') setX((v) => Math.min(max(), v + max() * 0.34))
    else if (e.key === 'ArrowLeft') setX((v) => Math.max(0, v - max() * 0.34))
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      finish()
    }
  }
  const pct = Math.round((x / max()) * 100)

  return (
    <div
      ref={track}
      className={`relative h-[52px] select-none overflow-hidden rounded-full p-1 transition-colors ${disabled ? 'bg-navy-200' : 'bg-wa-700'}`}
    >
      <div
        className={`absolute inset-y-0 left-0 rounded-full bg-wa-500 ${drag ? '' : 'transition-[width] duration-300'}`}
        style={{ width: x + H + 8 }}
      />
      <span
        className={`pointer-events-none absolute inset-0 flex items-center justify-center pl-8 text-sm font-semibold ${disabled ? 'text-navy-500' : 'text-white'}`}
        style={{ opacity: disabled ? 1 : Math.max(0.15, 1 - pct / 70) }}
      >
        {label}
      </span>
      <button
        type="button"
        role="slider"
        aria-label="Geser ke kanan untuk mengirim ke WhatsApp"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-disabled={disabled}
        disabled={disabled}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={key}
        className={`relative z-10 flex touch-none items-center justify-center rounded-full bg-white shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${disabled ? 'cursor-not-allowed text-navy-300' : 'cursor-grab text-wa-700 active:cursor-grabbing'} ${drag ? '' : 'transition-transform duration-300'}`}
        style={{ width: H, height: H, transform: `translateX(${x}px)` }}
      >
        <WaGlyph size={20} />
      </button>
    </div>
  )
}

export default function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<string>(kinds[0])
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [seen, setSeen] = useState(() => {
    try {
      return sessionStorage.getItem('bf-fb-seen') === '1'
    } catch {
      return false
    }
  })
  const area = useRef<HTMLTextAreaElement>(null)
  const trap = useRef<HTMLInputElement>(null)
  const openedAt = useRef(0)

  useEffect(() => {
    const on = () => setOpen(true)
    window.addEventListener('open-feedback', on)
    return () => window.removeEventListener('open-feedback', on)
  }, [])

  useEffect(() => {
    if (!open) return
    openedAt.current = performance.now()
    setSeen(true)
    try {
      sessionStorage.setItem('bf-fb-seen', '1')
    } catch {
      /* abaikan */
    }
    area.current?.focus()
    setNow(Date.now())
    const tick = window.setInterval(() => setNow(Date.now()), 1000)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearInterval(tick)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const lim = limits(now)
  const blocked = lim.wait > 0
  const tooShort = msg.trim().length < MIN_LEN

  const submit = () => {
    setErr('')
    const t = Date.now()
    const l = limits(t)
    if (msg.trim().length < MIN_LEN) return setErr(`Tulis minimal ${MIN_LEN} karakter ya, supaya kami paham maksudmu.`)
    if (l.wait > 0) return setErr(`Tunggu ${fmtWait(l.wait)} lagi sebelum kirim berikutnya.`)
    if (performance.now() - openedAt.current < MIN_OPEN_MS) return setErr('Pelan-pelan ya. Coba geser sekali lagi.')
    if (trap.current?.value) {
      // honeypot terisi: kemungkinan bot; pura-pura sukses tanpa membuka apa pun
      setDone(true)
      return
    }
    // Hanya teks yang diketik + path halaman; tidak pernah nama atau isi file.
    const text = `Halo BerkasFactory, saya mau kasih masukan.\n\n[${kind}] ${msg.trim()}\n\nHalaman: ${window.location.pathname}`
    memorySent = [...memorySent, t]
    writeSent([...l.sent, t])
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
    setMsg('')
    setDone(true)
    setNow(t)
  }

  const close = () => {
    setOpen(false)
    window.setTimeout(() => {
      setDone(false)
      setErr('')
    }, 200)
  }

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Kirim masukan lewat WhatsApp"
          className="fixed bottom-40 right-4 z-40 w-[min(92vw,22.5rem)] origin-bottom-right animate-[fb-pop_.22s_ease-out] overflow-hidden rounded-3xl bg-white shadow-card-hover ring-1 ring-navy-100 sm:bottom-20"
        >
          <style>{`@keyframes fb-pop{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}`}</style>
          <div className="relative flex items-center gap-3 bg-gradient-to-br from-wa-700 to-wa-600 px-4 py-3.5 text-white">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30">
              <WaGlyph size={22} />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-wa-700 bg-accent-400" />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="font-semibold">BerkasFactory</p>
              <p className="text-xs text-white/85">Masukan dan request, lewat WhatsApp</p>
            </div>
            <button onClick={close} aria-label="Tutup" className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          {done ? (
            <div className="space-y-3 bg-navy-50 p-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-wa-500 text-white shadow-card">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m5 12.5 4.500 4.500L19 7.500" />
                </svg>
              </span>
              <p className="font-semibold text-navy-900">WhatsApp sudah terbuka</p>
              <p className="text-sm text-navy-600">Tinggal tekan kirim di sana. Kalau tidak terbuka, cek pemblokir pop-up di browsermu.</p>
              <p className="text-xs text-navy-500">{blocked ? `Kirim lagi bisa dalam ${fmtWait(lim.wait)}.` : 'Terima kasih, ini beneran dibaca.'}</p>
              <button onClick={close} className="rounded-xl bg-navy-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-navy-800">Tutup</button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submit()
              }}
              className="space-y-3 bg-navy-50 p-4"
            >
              <p className="relative max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-sm text-navy-800 shadow-card">
                Halo! Ada masukan, bug, atau tool yang kamu mau? Tulis di sini, nanti dilanjut lewat WhatsApp.
              </p>
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Jenis masukan">
                {kinds.map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={kind === k}
                    onClick={() => setKind(k)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${kind === k ? 'border-wa-600 bg-wa-600 text-white shadow-card' : 'border-navy-200 bg-white text-navy-700 hover:border-wa-600'}`}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <div className="relative">
                <textarea
                  ref={area}
                  rows={3}
                  maxLength={MAX_LEN}
                  value={msg}
                  onChange={(e) => {
                    setMsg(e.target.value)
                    setErr('')
                  }}
                  placeholder="Tulis pesanmu…"
                  className={field}
                />
                <span className="pointer-events-none absolute bottom-2 right-3 text-[11px] text-navy-400">{msg.length}/{MAX_LEN}</span>
              </div>
              {/* honeypot: tersembunyi untuk manusia, sering diisi bot */}
              <input ref={trap} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />

              {err && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{err}</p>}
              {blocked && !err && (
                <p className="rounded-lg bg-accent-400/20 px-3 py-2 text-xs font-medium text-navy-800">
                  {lim.hourly ? `Kamu sudah kirim ${MAX_PER_HOUR} pesan dalam sejam. Coba lagi dalam ${fmtWait(lim.wait)}.` : `Tunggu ${fmtWait(lim.wait)} sebelum kirim lagi.`}
                </p>
              )}

              <SlideToSend
                disabled={blocked || tooShort}
                label={blocked ? `Tunggu ${fmtWait(lim.wait)}` : tooShort ? 'Tulis pesanmu dulu' : 'Geser untuk kirim ke WhatsApp'}
                onComplete={submit}
              />
              <p className="text-[11px] leading-snug text-navy-500">
                Yang ikut terkirim cuma tulisanmu dan alamat halaman ini. Filemu tidak ikut. Pesan lewat WhatsApp, jadi tunduk pada kebijakan WhatsApp.
              </p>
            </form>
          )}
        </div>
      )}
      <button
        onClick={() => (open ? close() : setOpen(true))}
        aria-label="Kasih masukan lewat WhatsApp"
        aria-expanded={open}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-wa-500 p-3.5 text-sm font-semibold text-white shadow-card-hover transition hover:-translate-y-0.5 hover:bg-wa-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wa-600 sm:bottom-4 sm:px-4 sm:py-3"
      >
        {!seen && <span aria-hidden className="absolute inset-0 -z-10 animate-ping rounded-full bg-wa-500/50" />}
        <WaGlyph />
        <span className="hidden sm:inline">Kasih masukan</span>
      </button>
    </>
  )
}
