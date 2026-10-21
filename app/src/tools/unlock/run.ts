import { PDFDocument } from '@cantoo/pdf-lib'
import type { RunFn } from '../../registry/types'

export interface UnlockOptions {
  password: string
}

export const run: RunFn<UnlockOptions> = async (inputs, opts, { progress }) => {
  const out = []
  for (let i = 0; i < inputs.length; i++) {
    progress(i, inputs.length, 'Membuka kunci')
    let src: PDFDocument
    try {
      src = await PDFDocument.load(inputs[i].data, { password: opts.password })
    } catch {
      throw new Error('Passwordnya belum cocok. Dicek lagi ya.')
    }
    // Salin halaman ke dokumen baru supaya hasilnya benar-benar tanpa enkripsi.
    const doc = await PDFDocument.create()
    const pages = await doc.copyPages(src, src.getPageIndices())
    pages.forEach((p) => doc.addPage(p))
    out.push({
      name: inputs[i].name.replace(/\.pdf$/i, '') + '-terbuka.pdf',
      data: await doc.save(),
      type: 'application/pdf',
    })
  }
  progress(inputs.length, inputs.length, 'Membuka kunci')
  return out
}
