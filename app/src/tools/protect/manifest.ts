import { lazy } from 'react'
import type { ToolDefinition } from '../../registry/types'

export const tool: ToolDefinition = {
  id: 'protect',
  slug: 'kunci-pdf',
  name: 'Kunci PDF',
  description: 'Pasang password supaya PDF hanya bisa dibuka olehmu.',
  category: 'pdf',
  status: 'stable',
  Page: lazy(() => import('./Page')),
}
