import type { ToolDefinition } from './types'

// Setiap tool mendaftar sendiri lewat src/tools/<id>/manifest.ts (tanpa edit file bersama).
const modules = import.meta.glob<{ tool: ToolDefinition }>('../tools/*/manifest.ts', { eager: true })

export const tools: ToolDefinition[] = Object.values(modules)
  .map((m) => m.tool)
  .sort((a, b) => a.name.localeCompare(b.name, 'id'))

export const findTool = (slug: string) => tools.find((t) => t.slug === slug)

export const categoryLabel = { pdf: 'PDF', image: 'Gambar', file: 'Lainnya' } as const
