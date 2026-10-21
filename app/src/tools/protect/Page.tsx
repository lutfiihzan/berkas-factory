import { useState } from 'react'
import ToolPage, { type OptionsProps } from '../../components/ToolPage'
import { Field, Note, inputCls } from '../../components/tool/controls'
import type { ProtectOptions } from './run'

function Options({ value, onChange }: OptionsProps<ProtectOptions>) {
  const [show, setShow] = useState(false)
  const type = show ? 'text' : 'password'
  const mismatch = value.confirm !== '' && value.password !== value.confirm
  return (
    <div className="space-y-4">
      <Field label="Password">
        <div className="flex gap-2">
          <input type={type} autoComplete="new-password" value={value.password}
            onChange={(e) => onChange({ ...value, password: e.target.value })} className={inputCls} />
          <button type="button" onClick={() => setShow(!show)} className="mt-1.5 shrink-0 rounded-xl border border-navy-200 bg-white px-4 text-sm font-semibold text-navy-700 transition hover:border-navy-400">
            {show ? 'Sembunyikan' : 'Tampilkan'}
          </button>
        </div>
      </Field>
      <Field label="Ulangi password">
        <input type={type} autoComplete="new-password" value={value.confirm}
          onChange={(e) => onChange({ ...value, confirm: e.target.value })} className={inputCls} />
      </Field>
      {mismatch && <p role="alert" className="text-sm font-medium text-red-700">Kedua password belum sama.</p>}
      <Note tone="warn">Kalau lupa password, kami tidak bisa memulihkannya. Simpan di tempat aman.</Note>
    </div>
  )
}

export default function Page() {
  return (
    <ToolPage
      toolId="protect"
      title="Kunci PDF"
      blurb="Pasang password supaya PDF hanya bisa dibuka olehmu. Filemu tidak diunggah ke mana pun."
      accept="application/pdf,.pdf"
      multiple
      mode="each"
      defaultOptions={{ password: '', confirm: '' }}
      Options={Options}
      actionLabel={(n) => `Kunci ${n} file`}
      canRun={(o) => (!o.password ? 'Isi passwordnya dulu.' : o.password !== o.confirm ? 'Kedua password harus sama.' : null)}
    />
  )
}
