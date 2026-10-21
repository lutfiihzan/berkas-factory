import { PDFDocument } from 'pdf-lib'
import type { RunFn } from '../../registry/types'

export const run: RunFn = async (inputs, _opts, { progress }) => {
  const out = await PDFDocument.create()
  for (let i = 0; i < inputs.length; i++) {
    progress(i, inputs.length, 'Menggabung')
    const src = await PDFDocument.load(inputs[i].data, { ignoreEncryption: false })
    const pages = await out.copyPages(src, src.getPageIndices())
    pages.forEach((pg) => out.addPage(pg))
  }
  progress(inputs.length, inputs.length, 'Menggabung')
  return [{ name: 'gabungan.pdf', data: await out.save(), type: 'application/pdf' }]
}
