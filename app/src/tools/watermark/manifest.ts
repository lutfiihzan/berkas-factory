import { lazy } from 'react'
import type { ToolDefinition } from '../../registry/types'

export const tool: ToolDefinition = {
  id: 'watermark',
  slug: 'watermark-pdf',
  name: 'Watermark PDF',
  description: 'Tambah teks watermark ke setiap halaman PDF.',
  category: 'pdf',
  status: 'stable',
  Page: lazy(() => import('./Page')),
}
