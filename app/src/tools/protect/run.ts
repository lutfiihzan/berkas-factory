import { PDFDocument } from '@cantoo/pdf-lib'
import type { RunFn } from '../../registry/types'

export interface ProtectOptions {
  password: string
  confirm: string
}

export const run: RunFn<ProtectOptions> = async (inputs, opts, { progress }) => {
  if (!opts.password) throw new Error('Isi passwordnya dulu.')
  if (opts.password !== opts.confirm) throw new Error('Konfirmasi password belum sama.')
  const out = []
  for (let i = 0; i < inputs.length; i++) {
    progress(i, inputs.length, 'Mengunci')
    const doc = await PDFDocument.load(inputs[i].data)
    doc.encrypt({ userPassword: opts.password, ownerPassword: opts.password, permissions: {} })
    out.push({
      name: inputs[i].name.replace(/\.pdf$/i, '') + '-terkunci.pdf',
      data: await doc.save(),
      type: 'application/pdf',
    })
  }
  progress(inputs.length, inputs.length, 'Mengunci')
  return out
}
