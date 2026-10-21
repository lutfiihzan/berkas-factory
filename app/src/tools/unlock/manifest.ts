import { lazy } from 'react'
import type { ToolDefinition } from '../../registry/types'

export const tool: ToolDefinition = {
  id: 'unlock',
  slug: 'buka-kunci-pdf',
  name: 'Buka Kunci PDF',
  description: 'Hapus password dari PDF yang passwordnya kamu ketahui.',
  category: 'pdf',
  status: 'stable',
  Page: lazy(() => import('./Page')),
}
