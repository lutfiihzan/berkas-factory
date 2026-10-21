import { PDFDocument, degrees } from 'pdf-lib'
import type { RunFn } from '../../registry/types'
import { parseRanges } from '../split/run'

export interface RotateOptions {
  angle: 90 | 180 | 270
  scope: 'all' | 'range'
  range: string
}

export const run: RunFn<RotateOptions> = async (inputs, opts, { progress }) => {
  const doc = await PDFDocument.load(inputs[0].data)
  const idx = opts.scope === 'range' ? parseRanges(opts.range, doc.getPageCount(), true) : doc.getPageIndices()
  progress(0, 1, 'Memutar')
  for (const i of idx) {
    const pg = doc.getPage(i)
    pg.setRotation(degrees((((pg.getRotation().angle + opts.angle) % 360) + 360) % 360))
  }
  progress(1, 1, 'Memutar')
  return [{ name: inputs[0].name.replace(/\.pdf$/i, '') + '-putar.pdf', data: await doc.save(), type: 'application/pdf' }]
}
