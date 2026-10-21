import { lazy } from 'react'
import type { ToolDefinition } from '../../registry/types'

export const tool: ToolDefinition = {
  id: 'ocr',
  slug: 'ocr',
  name: 'OCR: teks dari gambar/scan',
  description: 'Ambil teks dari gambar atau hasil scan.',
  category: 'file',
  status: 'lab',
  Page: lazy(() => import('./Page')),
}
