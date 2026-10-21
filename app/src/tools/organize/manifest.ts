import { lazy } from 'react'
import type { ToolDefinition } from '../../registry/types'

export const tool: ToolDefinition = {
  id: 'organize',
  slug: 'atur-halaman-pdf',
  name: 'Atur Halaman PDF',
  description: 'Hapus halaman dan ubah urutannya lewat daftar nomor halaman.',
  category: 'pdf',
  status: 'stable',
  Page: lazy(() => import('./Page')),
}
