import { lazy } from 'react'
import type { ToolDefinition } from '../../registry/types'

export const tool: ToolDefinition = {
  id: 'remove-bg',
  slug: 'hapus-background',
  name: 'Hapus background',
  description: 'Hapus latar foto langsung di browsermu.',
  category: 'image',
  status: 'lab',
  Page: lazy(() => import('./Page')),
}
