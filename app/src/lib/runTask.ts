import type { InputFile, OutputFile, ProgressFn } from '../registry/types'

export interface TaskHandle {
  promise: Promise<OutputFile[]>
  cancel: () => void
}

/** Jalankan src/tools/<toolId>/run.ts di Web Worker baru. Input dipindah (transfer), bukan disalin. */
export function runTask(toolId: string, files: InputFile[], options: unknown, onProgress?: ProgressFn): TaskHandle {
  const worker = new Worker(new URL('../workers/task.worker.ts', import.meta.url), { type: 'module' })
  let reject!: (e: Error) => void
  const promise = new Promise<OutputFile[]>((res, rej) => {
    reject = rej
    worker.onmessage = (e) => {
      const m = e.data
      if (m.type === 'progress') onProgress?.(m.done, m.total, m.label)
      else if (m.type === 'done') { worker.terminate(); res(m.out) }
      else if (m.type === 'error') { worker.terminate(); rej(new Error(m.message)) }
    }
    worker.onerror = (e) => { worker.terminate(); rej(new Error(e.message || 'Worker error')) }
  })
  worker.postMessage({ toolId, files, options }, files.map((f) => f.data.buffer as ArrayBuffer))
  return { promise, cancel: () => { worker.terminate(); reject(new Error('Dibatalkan')) } }
}
