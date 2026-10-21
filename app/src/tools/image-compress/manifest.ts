import { lazy } from 'react'
import type { ToolDefinition } from '../../registry/types'

export const tool: ToolDefinition = {
  id: 'image-compress',
  slug: 'kompres-gambar',
  name: 'Kompres gambar',
  description: 'Kecilkan ukuran foto tanpa upload.',
  category: 'image',
  status: 'stable',
  Page: lazy(() => import('./Page')),
}
