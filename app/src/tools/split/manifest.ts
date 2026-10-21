import { lazy } from 'react'
import type { ToolDefinition } from '../../registry/types'

export const tool: ToolDefinition = {
  id: 'split',
  slug: 'pisah-pdf',
  name: 'Pisah PDF',
  description: 'Ambil halaman tertentu, atau pecah PDF jadi beberapa file.',
  category: 'pdf',
  status: 'stable',
  Page: lazy(() => import('./Page')),
}
