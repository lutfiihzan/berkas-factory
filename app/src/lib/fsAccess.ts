import type { OutputFile } from '../registry/types'

/** Path relatif (termasuk nama file) untuk File yang berasal dari folder. */
const relPaths = new WeakMap<File, string>()

export const setRelPath = (f: File, path: string) => { relPaths.set(f, path) }

export const relPathOf = (f: File): string => {
  const p = relPaths.get(f) || (f as File & { webkitRelativePath?: string }).webkitRelativePath || ''
  return p.replace(/\\/g, '/').replace(/^\/+/, '')
}

/** Bagian folder dari path relatif, tanpa nama file. '' kalau file lepas. */
export const dirOf = (f: File): string => {
  const p = relPathOf(f)
  const i = p.lastIndexOf('/')
  return i > 0 ? p.slice(0, i) : ''
}

interface FsEntry {
  isFile: boolean
  isDirectory: boolean
  fullPath: string
  file?: (ok: (f: File) => void, err: (e: unknown) => void) => void
  createReader?: () => { readEntries: (ok: (e: FsEntry[]) => void, err: (e: unknown) => void) => void }
}

const readAll = (entry: FsEntry): Promise<FsEntry[]> =>
  new Promise((resolve, reject) => {
    const reader = entry.createReader!()
    const all: FsEntry[] = []
    const next = () =>
      reader.readEntries((batch) => {
        if (!batch.length) return resolve(all)
        all.push(...batch)
        next()
      }, reject)
    next()
  })

async function walk(entry: FsEntry, out: File[]): Promise<void> {
  if (entry.isFile) {
    const f = await new Promise<File>((ok, err) => entry.file!(ok, err))
    setRelPath(f, entry.fullPath.replace(/^\/+/, ''))
    out.push(f)
  } else if (entry.isDirectory) {
    const kids = await readAll(entry)
    kids.sort((a, b) => a.fullPath.localeCompare(b.fullPath, undefined, { numeric: true }))
    for (const k of kids) await walk(k, out)
  }
}

/** Ambil file dari drop; folder ditelusuri rekursif. Harus dipanggil sinkron di dalam handler drop. */
export function collectDropped(dt: DataTransfer): Promise<File[]> {
  const entries: FsEntry[] = []
  let hasDir = false
  for (const it of Array.from(dt.items || [])) {
    if (it.kind !== 'file') continue
    const e = (it as DataTransferItem & { webkitGetAsEntry?: () => FsEntry | null }).webkitGetAsEntry?.()
    if (e) { entries.push(e); if (e.isDirectory) hasDir = true }
  }
  if (!hasDir) return Promise.resolve(Array.from(dt.files))
  return (async () => {
    const out: File[] = []
    for (const e of entries) await walk(e, out)
    return out
  })()
}

/** Rapikan path keluaran: pisah dengan '/', buang '..' dan segmen kosong. */
export const cleanPath = (name: string) =>
  name.replace(/\\/g, '/').split('/').filter((s) => s && s !== '.' && s !== '..').join('/') || 'file'

/** Nama unik dan deterministik (urut input): bentrok (tak peduli besar-kecil huruf) diberi -2, -3, dst. */
export function uniqueNames(names: string[]): string[] {
  const used = new Set<string>()
  return names.map((raw) => {
    const name = cleanPath(raw)
    const slash = name.lastIndexOf('/')
    const dir = name.slice(0, slash + 1)
    const leaf = name.slice(slash + 1)
    const dot = leaf.lastIndexOf('.')
    const stem = dot > 0 ? leaf.slice(0, dot) : leaf
    const ext = dot > 0 ? leaf.slice(dot) : ''
    let n = name
    for (let i = 2; used.has(n.toLowerCase()); i++) n = `${dir}${stem}-${i}${ext}`
    used.add(n.toLowerCase())
    return n
  })
}

type DirHandle = {
  getDirectoryHandle: (n: string, o: { create: boolean }) => Promise<DirHandle>
  getFileHandle: (n: string, o: { create: boolean }) => Promise<{
    createWritable: () => Promise<{ write: (d: BlobPart) => Promise<void>; close: () => Promise<void> }>
  }>
}

type PickerWindow = Window & { showDirectoryPicker?: (o?: { mode?: 'readwrite' }) => Promise<DirHandle> }

export const canPickDir = () => typeof (window as PickerWindow).showDirectoryPicker === 'function'

/** Tulis hasil ke folder pilihan. 'cancel' bila pengguna membatalkan pemilih folder. */
export async function saveToDirectory(files: OutputFile[]): Promise<'ok' | 'cancel'> {
  let root: DirHandle
  try {
    root = await (window as PickerWindow).showDirectoryPicker!({ mode: 'readwrite' })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return 'cancel'
    throw e
  }
  const names = uniqueNames(files.map((f) => f.name))
  for (let i = 0; i < files.length; i++) {
    const parts = names[i].split('/')
    const leaf = parts.pop()!
    let dir = root
    for (const part of parts) dir = await dir.getDirectoryHandle(part, { create: true })
    const w = await (await dir.getFileHandle(leaf, { create: true })).createWritable()
    await w.write(files[i].data as BlobPart)
    await w.close()
  }
  return 'ok'
}
