import { useEffect, useState } from 'react'

/** Muncul sebentar setelah service worker aktif ("Siap dipakai offline"). */
export default function OfflineBadge() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return
    let timer: number | undefined
    let alive = true
    navigator.serviceWorker.ready.then(() => {
      if (!alive) return
      let seen = false
      try { seen = !!sessionStorage.getItem('bf-offline-shown'); sessionStorage.setItem('bf-offline-shown', '1') } catch { /* abaikan */ }
      if (seen) return
      setShow(true)
      timer = window.setTimeout(() => setShow(false), 5000)
    })
    return () => { alive = false; window.clearTimeout(timer) }
  }, [])

  if (!show) return null
  return (
    <div role="status" className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full bg-navy-900 px-4 py-2 text-sm text-white shadow-card-hover">
      <span aria-hidden className="h-2 w-2 rounded-full bg-accent-400" />
      Siap dipakai offline
    </div>
  )
}
