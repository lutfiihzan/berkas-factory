import { useEffect, useState, type ReactNode } from 'react'
import { pdfjs } from '../lib/pdfjs'
import { usePreview } from '../lib/thumbs'

export interface PreviewInfo {
  /** halaman yang sedang ditampilkan (mulai 1) */
  page: number
  /** jumlah halaman, null bila belum diketahui */
  numPages: number | null
  /** ukuran halaman asli dalam poin PDF (atau piksel untuk gambar) */
  pageW: number
  pageH: number
}

interface DocInfo { numPages: number; w: number; h: number }

const infoCache = new WeakMap<File, Map<number, Promise<DocInfo | null>>>()

async function readInfo(file: File, page: number): Promise<DocInfo | null> {
  if (file.type.startsWith('image/')) return null
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  try {
    const pg = await doc.getPage(Math.min(Math.max(1, page), doc.numPages))
    const v = pg.getViewport({ scale: 1 })
    return { numPages: doc.numPages, w: v.width, h: v.height }
  } finally {
    void doc.loadingTask.destroy()
  }
}

function loadInfo(file: File, page: number): Promise<DocInfo | null> {
  let m = infoCache.get(file)
  if (!m) infoCache.set(file, (m = new Map()))
  let p = m.get(page)
  if (!p) {
    p = readInfo(file, page).catch(() => null)
    m.set(page, p)
  }
  return p
}

interface Props {
  files: File[]
  /** lebar tampilan dalam px (maks 100% kolom) */
  width?: number
  /** putar tampilan halaman (derajat, kelipatan 90) */
  rotate?: number
  /** overlay absolut di atas halaman; bisa fungsi yang menerima info halaman */
  children?: ReactNode | ((info: PreviewInfo) => ReactNode)
  caption?: ReactNode
}

export default function PagePreview({ files, width = 260, rotate = 0, children, caption }: Props) {
  const file = files[0]
  const [page, setPage] = useState(1)
  const [info, setInfo] = useState<DocInfo | null>(null)
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)
  const numPages = info?.numPages ?? null
  const cur = numPages ? Math.min(page, numPages) : page
  const src = usePreview(file, cur, Math.min(width * 2, 520))

  useEffect(() => { setPage(1) }, [file])
  useEffect(() => {
    let live = true
    setInfo(null)
    if (file) void loadInfo(file, cur).then((i) => live && setInfo(i))
    return () => { live = false }
  }, [file, cur])

  if (!file) {
    return <div className="rounded-2xl border-2 border-dashed border-navy-200 bg-navy-50 p-5 text-center text-xs text-navy-500">Pilih file dulu untuk lihat pratinjau.</div>
  }

  const pageW = info?.w ?? natural?.w ?? 595
  const pageH = info?.h ?? natural?.h ?? 842
  const odd = rotate % 180 !== 0
  const ratio = odd ? pageH / pageW : pageW / pageH
  const pi: PreviewInfo = { page: cur, numPages, pageW, pageH }

  return (
    <div className="mx-auto w-full" style={{ maxWidth: width }}>
      <div
        className="relative w-full overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-navy-200"
        style={{ aspectRatio: String(ratio), containerType: 'inline-size' }}
      >
        {src === null && <div className="absolute inset-0 animate-pulse bg-navy-100" />}
        {src === '' && (
          <div className="absolute inset-0 flex items-center justify-center p-3 text-center text-xs text-navy-500">Pratinjau tidak tersedia</div>
        )}
        {src && (
          <img
            src={src}
            alt={`Pratinjau halaman ${cur}`}
            draggable={false}
            onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            className="absolute left-1/2 top-1/2 max-w-none select-none"
            style={{
              width: odd ? `${100 * (pageW / pageH)}%` : '100%',
              transform: `translate(-50%,-50%) rotate(${rotate}deg)`,
              transition: 'transform .2s',
            }}
          />
        )}
        {src && !rotate && children && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {typeof children === 'function' ? children(pi) : children}
          </div>
        )}
      </div>
      {numPages && numPages > 1 && (
        <div className="mt-3 flex items-center justify-center gap-3 text-xs font-medium text-navy-600">
          <button type="button" disabled={cur <= 1} onClick={() => setPage(cur - 1)}
            className="rounded-lg border border-navy-200 bg-white px-2.5 py-0.5 transition hover:border-navy-400 disabled:opacity-40" aria-label="Halaman sebelumnya">&lsaquo;</button>
          <span>Hal. {cur} / {numPages}</span>
          <button type="button" disabled={cur >= numPages} onClick={() => setPage(cur + 1)}
            className="rounded-lg border border-navy-200 bg-white px-2.5 py-0.5 transition hover:border-navy-400 disabled:opacity-40" aria-label="Halaman berikutnya">&rsaquo;</button>
        </div>
      )}
      {caption && <p className="mt-1 text-center text-xs text-navy-500">{caption}</p>}
    </div>
  )
}
