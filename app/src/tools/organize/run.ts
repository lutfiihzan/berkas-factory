import { PDFDocument } from 'pdf-lib'
import type { RunFn } from '../../registry/types'
import { parseRanges } from '../split/run'

export interface OrganizeOptions {
  order: string
}

export const run: RunFn<OrganizeOptions> = async (inputs, opts, { progress }) => {
  const src = await PDFDocument.load(inputs[0].data)
  const idx = parseRanges(opts.order, src.getPageCount())
  progress(0, 1, 'Menyusun')
  const doc = await PDFDocument.create()
  const pages = await doc.copyPages(src, idx)
  pages.forEach((p) => doc.addPage(p))
  progress(1, 1, 'Menyusun')
  return [{ name: inputs[0].name.replace(/\.pdf$/i, '') + '-atur.pdf', data: await doc.save(), type: 'application/pdf' }]
}
