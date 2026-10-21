import { lazy } from 'react'
import type { ToolDefinition } from '../../registry/types'

export const tool: ToolDefinition = {
  id: 'rotate',
  slug: 'putar-pdf',
  name: 'Putar PDF',
  description: 'Putar semua halaman atau sebagian saja, 90, 180, atau 270 derajat.',
  category: 'pdf',
  status: 'stable',
  Page: lazy(() => import('./Page')),
}
