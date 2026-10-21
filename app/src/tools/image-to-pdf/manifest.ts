import { lazy } from 'react'
import type { ToolDefinition } from '../../registry/types'

export const tool: ToolDefinition = {
  id: 'image-to-pdf',
  slug: 'jpg-ke-pdf',
  name: 'JPG ke PDF',
  description: 'Ubah gambar JPG atau PNG jadi satu PDF, satu halaman per gambar.',
  category: 'image',
  status: 'stable',
  Page: lazy(() => import('./Page')),
}
