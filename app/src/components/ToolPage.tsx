import { useEffect, useRef, useState, type ComponentType, type DragEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { BatchMode, OutputFile } from '../registry/types'
import { runTask, type TaskHandle } from '../lib/runTask'
import { formatBytes, readFile } from '../lib/files'
import { canPickDir, collectDropped, dirOf, relPathOf, saveToDirectory } from '../lib/fsAccess'
import ToolIcon from './ToolIcon'
import UploadZone, { Benefits } from './tool/UploadZone'
import FileCard from './tool/FileCard'
import ProgressPanel from './tool/ProgressPanel'
import ResultPanel from './tool/ResultPanel'
import './tool/tool.css'

export interface Item {
  id: string
  file: File
  /** Path relatif dari folder asal (termasuk nama file), kosong bila file lepas */
  path?: string
  status: 'idle' | 'running' | 'done' | 'error'
  error?: string
  /** Fraksi progres 0..1 saat berjalan (bila tool mengirim progres) */
  frac?: number
  /** Keterangan singkat dari tool, mis. "Halaman 3/10" */
  note?: string
}

export interface OptionsProps<O> {
  value: O
  onChange: (v: O) => void
  files: File[]
}

interface Props<O> {
  toolId: string
  title: string
  blurb: string
  /** atribut accept untuk <input>, mis. "application/pdf,.pdf" */
  accept: string
  multiple?: boolean
  /** 'combine' = N file -> 1 hasil, 'each' = N file -> N hasil (antrean) */
  mode: BatchMode
  defaultOptions: O
  Options?: ComponentType<OptionsProps<O>>
  actionLabel: (n: number) => string
  /** Kembalikan alasan (teks) kalau tombol aksi belum boleh dipakai, atau null kalau siap. */
  canRun?: (options: O) => string | null
}

const CONCURRENCY = Math.max(1, Math.min(3, (navigator.hardwareConcurrency || 2) - 1))
let seq = 0

const MB = 1024 * 1024
const BIG_FILE = 100 * MB
const WARN_COUNT = 100
const WARN_TOTAL = 500 * MB
const WARN_SINGLE = 300 * MB
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const sumBytes = (xs: OutputFile[]) => xs.reduce((s, o) => s + o.data.byteLength, 0)

const acceptsFile = (f: File, accept: string) =>
  accept.split(',').some((a) => {
    a = a.trim().toLowerCase()
    if (a.startsWith('.')) return f.name.toLowerCase().endsWith(a)
    if (a.endsWith('/*')) return f.type.startsWith(a.slice(0, -1))
    return f.type === a
  })

const EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'application/pdf': 'pdf' }
const extFor = (type: string) => EXT[type] ?? (type.split('/')[1] || 'png')

/** Gambar dari clipboard biasanya bernama "image.png" atau kosong: beri nama yang jelas. */
function namePasted(f: File, i: number): File {
  if (f.name && !/^image\.[a-z0-9]+$/i.test(f.name)) return f
  return new File([f], `tempel-${Date.now()}${i ? `-${i}` : ''}.${extFor(f.type)}`, { type: f.type })
}

const NON_TEXT_INPUTS = new Set(['checkbox', 'radio', 'range', 'file', 'button', 'submit', 'color', 'image', 'reset'])
const isTextTarget = (t: unknown) => {
  const el = t as HTMLElement | null
  if (!el || !el.tagName) return false
  if (el.tagName === 'TEXTAREA' || el.isContentEditable) return true
  return el.tagName === 'INPUT' && !NON_TEXT_INPUTS.has((el as HTMLInputElement).type)
}

export default function ToolPage<O>(p: Props<O>) {
  const [items, setItems] = useState<Item[]>([])
  const [options, setOptions] = useState<O>(p.defaultOptions)
  const [busy, setBusy] = useState(false)
  const [run, setRun] = useState({ done: 0, total: 0, label: '', got: false })
  const [outputs, setOutputs] = useState<OutputFile[]>([])
  const [error, setError] = useState('')
  const [over, setOver] = useState(false)
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [dropAt, setDropAt] = useState<number | null>(null)
  const [, bump] = useState(0)
  const handles = useRef<TaskHandle[]>([])
  const cancelled = useRef(false)
  const startedAt = useRef(0)
  const input = useRef<HTMLInputElement>(null)
  const folderInput = useRef<HTMLInputElement>(null)
  const [confirm, setConfirm] = useState<string | null>(null)
  const confirmRetry = useRef(false)
  const [saveMsg, setSaveMsg] = useState('')
  // Hasil per item (mode 'each'), supaya "Coba lagi yang gagal" menjaga hasil yang sudah sukses
  const results = useRef(new Map<string, OutputFile[]>())
  const [sizes, setSizes] = useState<{ before: number; after: number } | null>(null)

  // Riwayat perubahan daftar file (tambah, hapus, urut ulang) untuk Ctrl+Z / Ctrl+Shift+Z
  const itemsRef = useRef<Item[]>([])
  itemsRef.current = items
  const undoStack = useRef<Item[][]>([])
  const redoStack = useRef<Item[][]>([])

  const commit = (next: Item[]) => {
    undoStack.current.push(itemsRef.current)
    if (undoStack.current.length > 50) undoStack.current.shift()
    redoStack.current = []
    itemsRef.current = next
    setItems(next)
    bump((n) => n + 1)
  }
  const restore = (list: Item[]) => {
    itemsRef.current = list
    setItems(list.map((x) => ({ ...x, status: 'idle', error: undefined, frac: undefined, note: undefined })))
    results.current.clear()
    setConfirm(null)
    setOutputs([])
    bump((n) => n + 1)
  }
  const undo = () => {
    const prev = undoStack.current.pop()
    if (!prev) return
    redoStack.current.push(itemsRef.current)
    restore(prev)
  }
  const redo = () => {
    const next = redoStack.current.pop()
    if (!next) return
    undoStack.current.push(itemsRef.current)
    restore(next)
  }

  const patch = (id: string, v: Partial<Item>) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...v } : x)))

  const add = (list: FileList | File[]) => {
    const ok = Array.from(list).filter((f) => acceptsFile(f, p.accept))
    const rejected = Array.from(list).length - ok.length
    setError(rejected ? `${rejected} file dilewati karena formatnya tidak didukung tool ini.` : '')
    if (!ok.length) return
    const next = ok.map((file): Item => ({ id: String(++seq), file, path: relPathOf(file) || undefined, status: 'idle' }))
    results.current.clear()
    setConfirm(null)
    setOutputs([])
    commit(p.multiple ? [...itemsRef.current, ...next] : next.slice(0, 1))
  }

  /** Tombol "Tempel": baca clipboard lewat Clipboard API bila tersedia. */
  const pasteFromClipboard = async () => {
    if (latest.current.busy) return
    if (!navigator.clipboard || typeof navigator.clipboard.read !== 'function') {
      setError('Browsermu belum mendukung tombol Tempel. Tekan Ctrl+V di halaman ini untuk menempel file atau gambar.')
      return
    }
    try {
      const files: File[] = []
      let i = 0
      for (const ci of await navigator.clipboard.read()) {
        for (const type of ci.types) {
          if (type.startsWith('text/')) continue
          const blob = await ci.getType(type)
          files.push(new File([blob], `tempel-${Date.now()}${i ? `-${i}` : ''}.${extFor(type)}`, { type }))
          i++
        }
      }
      if (!files.length) setError('Clipboard-mu tidak berisi file atau gambar. Salin gambarnya dulu, lalu klik Tempel.')
      else latest.current.add(files)
    } catch (e) {
      const denied = e instanceof DOMException && (e.name === 'NotAllowedError' || e.name === 'SecurityError')
      setError(denied
        ? 'Browser tidak mengizinkan membaca clipboard. Tidak apa-apa: tekan Ctrl+V di halaman ini untuk menempel.'
        : 'Gagal membaca clipboard. Coba tekan Ctrl+V di halaman ini.')
    }
  }

  // Seluruh halaman jadi area drop + paste + pintasan undo/redo. Handler memakai ref agar selalu versi terbaru.
  const latest = useRef({ add, undo, redo, busy })
  latest.current = { add, undo, redo, busy }
  useEffect(() => {
    let depth = 0
    const hasFiles = (e: globalThis.DragEvent) => !!e.dataTransfer?.types.includes('Files')
    const onEnter = (e: globalThis.DragEvent) => { if (hasFiles(e)) { depth++; setOver(true) } }
    const onOver = (e: globalThis.DragEvent) => { if (hasFiles(e)) e.preventDefault() }
    const onLeave = (e: globalThis.DragEvent) => { if (hasFiles(e) && --depth <= 0) { depth = 0; setOver(false) } }
    const onDropWin = (e: globalThis.DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      depth = 0
      setOver(false)
      if (!latest.current.busy && e.dataTransfer) {
        // webkitGetAsEntry harus dipanggil sinkron, penelusuran folder baru async
        collectDropped(e.dataTransfer).then((fs) => latest.current.add(fs)).catch(() => latest.current.add(e.dataTransfer?.files ?? []))
      }
    }
    const onPasteWin = (e: ClipboardEvent) => {
      if (latest.current.busy || isTextTarget(e.target) || isTextTarget(document.activeElement)) return
      const fs = Array.from(e.clipboardData?.files ?? [])
      if (!fs.length) return
      e.preventDefault()
      latest.current.add(fs.map(namePasted))
    }
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || latest.current.busy) return
      if (isTextTarget(e.target) || (e.target as HTMLElement | null)?.tagName === 'SELECT') return
      const k = e.key.toLowerCase()
      if (k === 'z' && !e.shiftKey) { e.preventDefault(); latest.current.undo() }
      else if ((k === 'z' && e.shiftKey) || k === 'y') { e.preventDefault(); latest.current.redo() }
    }
    window.addEventListener('dragenter', onEnter)
    window.addEventListener('dragover', onOver)
    window.addEventListener('dragleave', onLeave)
    window.addEventListener('drop', onDropWin)
    window.addEventListener('paste', onPasteWin)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('dragenter', onEnter)
      window.removeEventListener('dragover', onOver)
      window.removeEventListener('dragleave', onLeave)
      window.removeEventListener('drop', onDropWin)
      window.removeEventListener('paste', onPasteWin)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  // File yang dijatuhkan di beranda dikirim lewat navigate(state.files)
  const location = useLocation()
  useEffect(() => {
    const files = (location.state as { files?: File[] } | null)?.files
    if (files?.length) {
      add(files)
      window.history.replaceState({}, '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const reorder = (from: number, to: number) => {
    const xs = itemsRef.current
    if (from === to || from < 0 || to < 0 || from >= xs.length || to >= xs.length) return
    const c = [...xs]
    c.splice(to, 0, c.splice(from, 1)[0])
    commit(c)
  }
  const move = (i: number, d: -1 | 1) => reorder(i, i + d)
  const remove = (id: string) => commit(itemsRef.current.filter((x) => x.id !== id))

  const canReorder = p.mode === 'combine' && !!p.multiple && !busy
  const rowDrag = (i: number) => ({
    draggable: canReorder,
    onDragStart: (e: DragEvent) => { setDragFrom(i); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)) },
    onDragOver: (e: DragEvent) => { if (dragFrom !== null) { e.preventDefault(); setDropAt(i) } },
    onDrop: (e: DragEvent) => { if (dragFrom !== null) { e.preventDefault(); reorder(dragFrom, i) } setDragFrom(null); setDropAt(null) },
    onDragEnd: () => { setDragFrom(null); setDropAt(null) },
  })

  const sizeWarning = (list: Item[]) => {
    const total = list.reduce((s, i) => s + i.file.size, 0)
    if (list.length > WARN_COUNT || total > WARN_TOTAL || list.some((i) => i.file.size > WARN_SINGLE)) {
      return `Ada ${list.length} file (${formatBytes(total).replace('.', ',')}). Bisa lama dan berat di perangkatmu, tapi tetap jalan di sini. Lanjut?`
    }
    return null
  }

  /** Klik tombol aksi: tanya dulu kalau pekerjaannya besar. */
  const requestStart = (retry = false) => {
    const list = retry ? items.filter((i) => i.status === 'error') : items
    const w = sizeWarning(list)
    confirmRetry.current = retry
    if (w) setConfirm(w)
    else start(retry)
  }

  const start = async (retry = false) => {
    setConfirm(null)
    setBusy(true)
    setError('')
    setSaveMsg('')
    setOutputs([])
    cancelled.current = false
    startedAt.current = Date.now()
    try {
      if (p.mode === 'combine') {
        setRun({ done: 0, total: items.length, label: '', got: false })
        setItems((xs) => xs.map((x) => ({ ...x, status: 'running', error: undefined })))
        try {
          const out: OutputFile[] = []
          const files = await Promise.all(items.map(async (i) => ({ name: i.file.name, data: await readFile(i.file) })))
          const h = runTask(p.toolId, files, options, (d, t, l) => setRun({ done: d, total: t, label: l ?? 'Memproses', got: true }))
          handles.current = [h]
          out.push(...(await h.promise))
          setItems((xs) => xs.map((x) => ({ ...x, status: 'done' })))
          setOutputs(out)
          setSizes(null)
        } catch (e) {
          setItems((xs) => xs.map((x) => ({ ...x, status: 'idle' })))
          throw e
        }
      } else {
        if (!retry) results.current.clear()
        const queue = retry ? itemsRef.current.filter((i) => i.status === 'error') : items
        setRun({ done: 0, total: queue.length, label: '', got: false })
        let next = 0
        let done = 0
        let active = 0
        let bigActive = 0
        // Ambil item berikutnya; file besar (> 100 MB) jalan sendirian agar memori aman
        const take = (): Item | 'wait' | null => {
          if (cancelled.current || next >= queue.length) return null
          const it = queue[next]
          const big = it.file.size > BIG_FILE
          if (active > 0 && (big || bigActive > 0)) return 'wait'
          next++
          active++
          if (big) bigActive++
          return it
        }
        const worker = async () => {
          for (;;) {
            const it = take()
            if (it === null) return
            if (it === 'wait') { await sleep(50); continue }
            const big = it.file.size > BIG_FILE
            patch(it.id, { status: 'running', error: undefined, frac: undefined, note: undefined })
            try {
              let data: Uint8Array | null = await readFile(it.file)
              const h = runTask(p.toolId, [{ name: it.file.name, data }], options, (d, t, l) => {
                patch(it.id, { frac: t > 0 ? Math.min(1, d / t) : 0, note: l ? `${l} ${d}/${t}` : t > 1 ? `${d}/${t}` : undefined })
                setRun((r) => (r.got ? r : { ...r, got: true }))
              })
              data = null
              handles.current.push(h)
              const dir = dirOf(it.file)
              const out = (await h.promise).map((o) => ({ ...o, name: dir ? `${dir}/${o.name}` : o.name }))
              results.current.set(it.id, out)
              patch(it.id, { status: 'done', frac: 1 })
            } catch (e) {
              patch(it.id, { status: 'error', error: e instanceof Error ? e.message : String(e), frac: undefined })
            } finally {
              active--
              if (big) bigActive--
            }
            const n = ++done
            setRun((r) => ({ ...r, done: n }))
          }
        }
        await Promise.all(Array.from({ length: Math.max(1, Math.min(CONCURRENCY, queue.length)) }, worker))
        // Susun hasil sesuai urutan daftar, supaya ZIP deterministik
        const all: OutputFile[] = []
        let before = 0
        for (const i of itemsRef.current) {
          const r = results.current.get(i.id)
          if (r) { all.push(...r); before += i.file.size }
        }
        setSizes({ before, after: sumBytes(all) })
        setOutputs(all)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      handles.current = []
      setBusy(false)
    }
  }

  const cancel = () => {
    cancelled.current = true
    handles.current.forEach((h) => h.cancel())
  }

  const saveDir = async () => {
    setSaveMsg('')
    try {
      if ((await saveToDirectory(outputs)) === 'ok') setSaveMsg(`${outputs.length} file disimpan ke folder pilihanmu.`)
    } catch (e) {
      setSaveMsg(`Gagal menyimpan ke folder: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const failed = items.filter((i) => i.status === 'error').length
  const doneCount = items.filter((i) => i.status === 'done').length
  const Opt = p.Options
  const why = p.canRun?.(options) ?? null

  // Progres untuk bar utama
  const runningItems = items.filter((i) => i.status === 'running')
  let fraction: number | null = null
  if (p.mode === 'combine') {
    if (run.got && run.total > 0) fraction = Math.min(1, run.done / run.total)
  } else if ((run.got || run.total > 1) && run.total > 0) {
    fraction = Math.min(1, (run.done + runningItems.reduce((s, i) => s + (i.frac ?? 0), 0)) / run.total)
  }
  const elapsed = (Date.now() - startedAt.current) / 1000
  const etaSec = busy && fraction !== null && fraction > 0.05 && fraction < 1 && elapsed > 2 ? (elapsed * (1 - fraction)) / fraction : null
  const first = runningItems[0]
  const current = p.mode === 'combine'
    ? run.label ? `${run.label} ${run.done}/${run.total}` : `${items.length} file digabung jadi satu hasil`
    : first
      ? `${first.path || first.file.name}${first.note ? ` · ${first.note}` : ''}${runningItems.length > 1 ? ` (+${runningItems.length - 1} lainnya)` : ''}`
      : undefined

  const numbered = p.mode === 'combine' && !!p.multiple && items.length > 1
  const hasItems = items.length > 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-navy-500">
        <Link to="/" className="hover:text-brand-600 hover:underline">Beranda</Link>
        <span className="mx-2" aria-hidden>/</span>
        <span className="font-medium text-navy-700">{p.title}</span>
      </nav>
      <header className="mt-4 flex items-center gap-4">
        <ToolIcon id={p.toolId} size={56} />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-navy-900 sm:text-3xl">{p.title}</h1>
          <p className="mt-1 text-navy-600">{p.blurb}</p>
        </div>
      </header>

      {over && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-6 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-brand-500 bg-white px-12 py-10 shadow-card-hover">
            <span className="bf-breathe flex size-16 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
              <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v11" /><path d="m7.5 11 4.5 4.5 4.5-4.5" /><path d="M5 19h14" /></svg>
            </span>
            <p className="text-xl font-semibold text-navy-900">Lepas di sini</p>
            <p className="text-sm text-navy-500">Filemu diproses di browser, tidak diunggah.</p>
          </div>
        </div>
      )}

      <input ref={input} type="file" hidden multiple={p.multiple} accept={p.accept}
        onChange={(e) => { if (e.target.files) add(e.target.files); e.target.value = '' }} />
      {p.multiple && (
        <input
          ref={folderInput}
          type="file"
          hidden
          multiple
          data-folder-input
          {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
          onChange={(e) => {
            if (e.target.files) add(Array.from(e.target.files).sort((a, b) => relPathOf(a).localeCompare(relPathOf(b), undefined, { numeric: true })))
            e.target.value = ''
          }}
        />
      )}

      {!hasItems && (
        <>
          <UploadZone
            accept={p.accept}
            multiple={p.multiple}
            over={over}
            onPick={() => input.current?.click()}
            onPickFolder={p.multiple ? () => folderInput.current?.click() : undefined}
            onPaste={pasteFromClipboard}
          />
          <Benefits />
        </>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {(hasItems || undoStack.current.length > 0) && (
        <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-navy-500">
          <span className="min-w-0 flex-1">{canReorder && items.length > 1 ? 'Seret kartu untuk mengubah urutan.' : hasItems ? `${items.length} file dipilih` : ''}</span>
          <button disabled={busy || !undoStack.current.length} onClick={undo} title="Ctrl+Z" className="rounded-lg border border-navy-200 bg-white px-3 py-1.5 font-medium text-navy-700 transition hover:border-navy-400 disabled:opacity-40">Urungkan</button>
          <button disabled={busy || !redoStack.current.length} onClick={redo} title="Ctrl+Shift+Z" className="rounded-lg border border-navy-200 bg-white px-3 py-1.5 font-medium text-navy-700 transition hover:border-navy-400 disabled:opacity-40">Ulangi</button>
        </div>
      )}

      {hasItems && (
        <ul className={`mt-3 grid grid-cols-2 gap-4 rounded-3xl p-2 transition sm:grid-cols-3 lg:grid-cols-4 ${over ? 'bg-brand-500/10 outline-2 outline-dashed outline-brand-500' : ''}`}>
          {items.map((it, i) => (
            <FileCard
              key={it.id}
              item={it}
              index={i}
              count={items.length}
              numbered={numbered}
              canReorder={canReorder}
              busy={busy}
              dragging={dragFrom === i}
              dropTarget={dropAt === i && dragFrom !== null && dragFrom !== i}
              dragProps={rowDrag(i)}
              sharedFrac={p.mode === 'combine' ? fraction ?? undefined : undefined}
              onMove={(d) => move(i, d)}
              onRemove={() => remove(it.id)}
            />
          ))}
          {!busy && (
            <li className="min-w-0">
              <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-navy-300 bg-navy-50 p-3 text-center transition hover:border-brand-500 hover:bg-white">
                <button type="button" onClick={() => input.current?.click()} className="flex flex-col items-center gap-1 rounded-xl p-2 font-semibold text-navy-700 hover:text-brand-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30">
                  <span className="flex size-10 items-center justify-center rounded-full bg-white text-2xl leading-none text-brand-500 shadow-card" aria-hidden>+</span>
                  <span className="text-sm">{p.multiple ? 'Tambah file' : 'Ganti file'}</span>
                </button>
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
                  {p.multiple && <button type="button" onClick={() => folderInput.current?.click()} className="rounded-lg px-2 py-1 font-medium text-navy-500 hover:bg-navy-100 hover:text-navy-800">Pilih folder</button>}
                  <button type="button" onClick={pasteFromClipboard} className="rounded-lg px-2 py-1 font-medium text-navy-500 hover:bg-navy-100 hover:text-navy-800">Tempel</button>
                </div>
              </div>
            </li>
          )}
        </ul>
      )}

      {Opt && hasItems && (
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy-100 sm:p-6">
          <h2 className="mb-4 text-base font-bold text-navy-900">Opsi</h2>
          <Opt value={options} onChange={setOptions} files={items.map((i) => i.file)} />
        </section>
      )}

      {hasItems && confirm && !busy && (
        <div role="alertdialog" className="mt-6 rounded-2xl border border-accent-400 bg-accent-400/10 p-5 text-sm text-navy-900">
          <p>{confirm}</p>
          <div className="mt-4 flex gap-3">
            <button onClick={() => start(confirmRetry.current)} className="rounded-xl bg-brand-500 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-brand-600">Lanjut</button>
            <button onClick={() => setConfirm(null)} className="rounded-xl border border-navy-200 bg-white px-5 py-2.5 font-semibold hover:border-navy-400">Batal</button>
          </div>
        </div>
      )}

      {busy && (
        <ProgressPanel
          fraction={fraction}
          done={p.mode === 'combine' ? 0 : run.done}
          total={p.mode === 'combine' ? items.length : run.total}
          heading={p.mode === 'combine' ? `Mengerjakan ${items.length} file sekaligus` : undefined}
          current={current}
          etaSec={etaSec}
          onCancel={cancel}
        />
      )}

      {hasItems && !confirm && (
        <div className="sticky bottom-0 z-30 -mx-4 mt-6 flex flex-wrap items-center gap-3 border-t border-navy-100 bg-white/90 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <button
            data-testid="run"
            disabled={busy || !!why}
            onClick={() => requestStart(false)}
            className="w-full rounded-xl bg-brand-500 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:w-auto"
          >
            {busy ? 'Lagi dikerjain di browsermu…' : p.actionLabel(items.length)}
          </button>
          {!busy && p.mode === 'each' && failed > 0 && (
            <button onClick={() => requestStart(true)} className="rounded-xl border border-navy-200 bg-white px-5 py-3.5 text-sm font-semibold text-navy-800 shadow-sm hover:border-navy-400">
              Coba lagi yang gagal
            </button>
          )}
          {why && !busy && <span className="text-sm text-navy-500">{why}</span>}
        </div>
      )}

      {outputs.length > 0 && (
        <ResultPanel
          outputs={outputs}
          mode={p.mode}
          failed={failed}
          doneCount={doneCount}
          sizes={sizes}
          saveMsg={saveMsg}
          canSaveDir={canPickDir()}
          onSaveDir={saveDir}
        />
      )}
    </div>
  )
}
