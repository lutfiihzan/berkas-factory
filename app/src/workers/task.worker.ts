/// <reference lib="webworker" />
import type { InputFile, RunFn } from '../registry/types'

// Satu worker generik: memuat src/tools/<toolId>/run.ts secara lazy.
const runners = import.meta.glob<{ run: RunFn }>('../tools/*/run.ts')

self.onmessage = async (e: MessageEvent<{ toolId: string; files: InputFile[]; options: unknown }>) => {
  const { toolId, files, options } = e.data
  try {
    const load = runners[`../tools/${toolId}/run.ts`]
    if (!load) throw new Error(`Tool "${toolId}" tidak punya run.ts`)
    const { run } = await load()
    const out = await run(files, options, {
      progress: (done, total, label) => self.postMessage({ type: 'progress', done, total, label }),
    })
    self.postMessage({ type: 'done', out }, out.map((o) => o.data.buffer as ArrayBuffer))
  } catch (err) {
    self.postMessage({ type: 'error', message: err instanceof Error ? err.message : String(err) })
  }
}
