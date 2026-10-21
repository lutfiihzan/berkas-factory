import { zipSync } from 'fflate'
import type { OutputFile } from '../registry/types'
import { uniqueNames } from './fsAccess'

export const formatBytes = (n: number) => {
  if (n < 1024) return `${n} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`
  return `${(n / 1024 ** 3).toFixed(2)} GB`
}

export const baseName = (name: string) => name.replace(/\.[^.]+$/, '')

export const readFile = async (f: File) => new Uint8Array(await f.arrayBuffer())

export const toBlob = (o: OutputFile) => new Blob([o.data as BlobPart], { type: o.type })

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export function downloadZip(files: OutputFile[], zipName = 'hasil.zip') {
  const names = uniqueNames(files.map((f) => f.name))
  const entries: Record<string, Uint8Array> = {}
  files.forEach((f, i) => { entries[names[i]] = f.data })
  downloadBlob(new Blob([zipSync(entries, { level: 0 }) as BlobPart], { type: 'application/zip' }), zipName)
}
