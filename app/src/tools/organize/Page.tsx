import { useEffect, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import ToolPage, { type OptionsProps } from '../../components/ToolPage'
import { Field, Note, inputCls } from '../../components/tool/controls'
import { parseRanges } from '../split/run'
import type { OrganizeOptions } from './run'

function Options({ value, onChange, files }: OptionsProps<OrganizeOptions>) {
  const [total, setTotal] = useState(0)
  useEffect(() => {
    let ok = true
    setTotal(0)
    if (files[0]) {
      files[0].arrayBuffer()
        .then((b) => PDFDocument.load(b))
        .then((d) => { if (ok) setTotal(d.getPageCount()) })
        .catch(() => {})
    }
    return () => { ok = false }
  }, [files])
  let hint = ''
  if (total && value.order.trim()) {
    try { hint = `Hasil: ${parseRanges(value.order, total).length} halaman.` } catch (e) { hint = e instanceof Error ? e.message : '' }
  }
  return (
    <div className="space-y-3 text-sm">
      {total > 0 && <p className="font-medium text-navy-600">PDF ini punya {total} halaman.</p>}
      <Field label="Urutan halaman">
        <input className={inputCls} value={value.order} placeholder="3,1,2,5-7" onChange={(e) => onChange({ order: e.target.value })} />
      </Field>
      <Note>
        Tulis nomor halaman sesuai urutan yang kamu mau. Halaman yang tidak ditulis akan dihapus.
        Boleh pakai rentang (5-7), dan menulis halaman yang sama dua kali untuk menggandakannya.
      </Note>
      {hint && <p className="font-medium text-brand-700">{hint}</p>}
    </div>
  )
}

export default function Page() {
  return (
    <ToolPage<OrganizeOptions>
      toolId="organize"
      title="Atur Halaman PDF"
      blurb="Hapus halaman atau ubah urutannya. Cukup satu file PDF."
      accept="application/pdf,.pdf"
      mode="combine"
      defaultOptions={{ order: '' }}
      Options={Options}
      actionLabel={() => 'Susun PDF'}
      canRun={(o) => (o.order.trim() ? null : 'Tulis dulu urutan halamannya, mis. 3,1,2.')}
    />
  )
}
