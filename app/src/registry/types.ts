import type { ComponentType, LazyExoticComponent } from 'react'

export type Category = 'pdf' | 'image' | 'file'
export type Status = 'stable' | 'lab' | 'coming-soon'

/** 'combine' = N file -> 1 hasil, 'each' = N file -> N hasil */
export type BatchMode = 'combine' | 'each'

export interface ToolDefinition {
  /** Sama dengan nama folder di src/tools/<id>; juga kunci untuk worker */
  id: string
  /** URL: /<slug> */
  slug: string
  name: string
  description: string
  category: Category
  status: Status
  /** Halaman tool (hanya untuk status stable/lab) */
  Page?: LazyExoticComponent<ComponentType>
}

export interface InputFile {
  name: string
  data: Uint8Array
}

export interface OutputFile {
  name: string
  data: Uint8Array
  type: string
}

export type ProgressFn = (done: number, total: number, label?: string) => void

/** Kontrak src/tools/<id>/run.ts: `export async function run(...)`; berjalan di Web Worker */
export type RunFn<O = unknown> = (
  inputs: InputFile[],
  options: O,
  ctx: { progress: ProgressFn },
) => Promise<OutputFile[]>
