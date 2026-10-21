import { useEffect, useState } from 'react'
import { pdfjs } from './pdfjs'

const cache = new WeakMap<File, Map<string, Promise<string>>>()

/** Render satu halaman PDF (atau gambar) ke data URL. Lebar dalam piksel CSS; hasil di-cache per file. */
export function renderPreview(file: File, page = 1, width = 160): Promise<string> {
  const key = `${page}:${width}`
  let perFile = cache.get(file)
  if (!perFile) cache.set(file, (perFile = new Map()))
  let p = perFile.get(key)
  if (!p) {
    p = draw(file, page, width).catch(() => '')
    perFile.set(key, p)
  }
  return p
}

async function draw(file: File, page: number, width: number): Promise<string> {
  if (file.type.startsWith('image/')) return URL.createObjectURL(file)
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) })
  const doc = await task.promise
  try {
    const pg = await doc.getPage(Math.min(Math.max(1, page), doc.numPages))
    const base = pg.getViewport({ scale: 1 })
    const scale = (width * Math.min(2, window.devicePixelRatio || 1)) / base.width
    const viewport = pg.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    await pg.render({ canvas, viewport }).promise
    return canvas.toDataURL('image/jpeg', 0.8)
  } finally {
    void task.destroy()
  }
}

/** Hook: URL pratinjau halaman `page` dari `file`; null selagi memuat, '' bila gagal (mis. PDF berpassword). */
export function usePreview(file: File | undefined, page = 1, width = 160) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    let live = true
    setSrc(null)
    if (file) void renderPreview(file, page, width).then((s) => live && setSrc(s))
    return () => { live = false }
  }, [file, page, width])
  return src
}

const countCache = new WeakMap<File, Promise<number | null>>()

/** Jumlah halaman PDF (di-cache per file). null untuk non-PDF atau PDF yang gagal dibaca (mis. berpassword). */
export function getPageCount(file: File): Promise<number | null> {
  let p = countCache.get(file)
  if (!p) {
    if (file.type.startsWith('image/') || !(file.type === 'application/pdf' || /\.pdf$/i.test(file.name))) p = Promise.resolve(null)
    else {
      p = (async () => {
        const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) })
        try {
          return (await task.promise).numPages
        } finally {
          void task.destroy()
        }
      })().catch(() => null)
    }
    countCache.set(file, p)
  }
  return p
}

/** Hook: jumlah halaman PDF; undefined selagi memuat, null bila tidak berlaku/gagal. */
export function usePageCount(file: File | undefined) {
  const [n, setN] = useState<number | null | undefined>(undefined)
  useEffect(() => {
    let live = true
    setN(undefined)
    if (file) void getPageCount(file).then((c) => live && setN(c))
    return () => { live = false }
  }, [file])
  return n
}
