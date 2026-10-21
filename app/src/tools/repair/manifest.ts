import { lazy } from 'react'
import type { ToolDefinition } from '../../registry/types'

export const tool: ToolDefinition = {
  id: 'repair',
  slug: 'perbaiki-file',
  name: 'Perbaiki file',
  description: 'PDF yang tidak mau terbuka, kita coba selamatkan.',
  category: 'file',
  status: 'lab',
  Page: lazy(() => import('./Page')),
}
