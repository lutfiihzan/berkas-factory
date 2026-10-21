import { lazy } from 'react'
import type { ToolDefinition } from '../../registry/types'

export const tool: ToolDefinition = {
  id: 'compress',
  slug: 'kompres-pdf',
  name: 'Kompres PDF',
  description: 'Perkecil ukuran PDF supaya gampang dikirim. Pilih tingkat kompresinya.',
  category: 'pdf',
  status: 'stable',
  Page: lazy(() => import('./Page')),
}
