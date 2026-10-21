import { lazy } from 'react'
import type { ToolDefinition } from '../../registry/types'

export const tool: ToolDefinition = {
  id: 'merge',
  slug: 'gabung-pdf',
  name: 'Gabung PDF',
  description: 'Susun beberapa file jadi satu. Atur urutannya dulu.',
  category: 'pdf',
  status: 'stable',
  Page: lazy(() => import('./Page')),
}
