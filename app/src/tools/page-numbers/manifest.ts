import { lazy } from 'react'
import type { ToolDefinition } from '../../registry/types'

export const tool: ToolDefinition = {
  id: 'page-numbers',
  slug: 'nomor-halaman-pdf',
  name: 'Nomor Halaman PDF',
  description: 'Tambah nomor halaman ke PDF, tentukan posisi dan format.',
  category: 'pdf',
  status: 'stable',
  Page: lazy(() => import('./Page')),
}
