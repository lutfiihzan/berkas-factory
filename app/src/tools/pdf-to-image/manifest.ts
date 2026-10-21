import { lazy } from 'react'
import type { ToolDefinition } from '../../registry/types'

export const tool: ToolDefinition = {
  id: 'pdf-to-image',
  slug: 'pdf-ke-jpg',
  name: 'PDF ke JPG',
  description: 'Ubah tiap halaman PDF jadi gambar JPG atau PNG.',
  category: 'pdf',
  status: 'stable',
  Page: lazy(() => import('./Page')),
}
