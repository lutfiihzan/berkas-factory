import { useEffect, useState } from 'react'

const kinds = ['Request tool', 'Bug', 'Saran', 'Lainnya'] as const
const field = 'mt-1 w-full rounded-xl border border-navy-200 bg-white p-2.5 text-navy-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25'
const primary = 'rounded-xl bg-brand-600 px-5 py-2 font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500'

export default function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<string>(kinds[0])
  const [msg, setMsg] = useState('')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const on = () => setOpen(true)
    window.addEventListener('open-feedback', on)
    return () => window.removeEventListener('open-feedback', on)
  }, [])

  const close = () => {
    setOpen(false)
    setSent(false)
  }
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: ganti mailto dengan endpoint feedback saat sudah ada.
    const body = msg + (email ? '\n\nEmail: ' + email : '')
    const subject = '[BerkasFactory] ' + kind
    window.location.href = 'mailto:feedback@example.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body)
    setSent(true)
    setMsg('')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-navy-900 px-4 py-2.5 text-sm sm:bottom-4 font-medium text-white shadow-card-hover transition hover:-translate-y-0.5 hover:bg-navy-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 4h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-8l-4 4v-4H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
        </svg>
        Kasih masukan
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/60 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fb-title"
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 text-navy-900 shadow-card-hover"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="fb-title" className="text-lg font-bold">Kasih masukan</h2>
            {sent ? (
              <div className="mt-3 space-y-3 text-sm">
                <p>Terima kasih. Aplikasi emailmu terbuka dengan pesan yang sudah terisi. Tinggal kirim.</p>
                <button onClick={close} className={primary}>Tutup</button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-3 space-y-3 text-sm">
                <label className="block">Jenis
                  <select value={kind} onChange={(e) => setKind(e.target.value)} className={field}>
                    {kinds.map((k) => <option key={k}>{k}</option>)}
                  </select>
                </label>
                <label className="block">Pesan
                  <textarea required rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} className={field} />
                </label>
                <label className="block">Email (opsional)
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
                </label>
                <p className="text-navy-600">Yang terkirim cuma tulisan di atas. Filemu tidak ikut, dan tidak pernah kami lihat.</p>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={close} className="rounded-xl px-4 py-2 text-navy-700 hover:bg-navy-100">Batal</button>
                  <button type="submit" className={primary}>Kirim</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
