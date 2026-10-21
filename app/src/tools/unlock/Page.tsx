import { useState } from 'react'
import ToolPage, { type OptionsProps } from '../../components/ToolPage'
import { Field, Note, inputCls } from '../../components/tool/controls'
import type { UnlockOptions } from './run'

function Options({ value, onChange }: OptionsProps<UnlockOptions>) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-4">
      <Field label="Password PDF">
        <div className="flex gap-2">
          <input
            type={show ? 'text' : 'password'}
            autoComplete="off"
            value={value.password}
            onChange={(e) => onChange({ password: e.target.value })}
            className={inputCls}
          />
          <button type="button" onClick={() => setShow(!show)} className="mt-1.5 shrink-0 rounded-xl border border-navy-200 bg-white px-4 text-sm font-semibold text-navy-700 transition hover:border-navy-400">
            {show ? 'Sembunyikan' : 'Tampilkan'}
          </button>
        </div>
      </Field>
      <Note>Pakai ini hanya untuk file yang passwordnya kamu ketahui.</Note>
    </div>
  )
}

export default function Page() {
  return (
    <ToolPage
      toolId="unlock"
      title="Buka Kunci PDF"
      blurb="Hapus password dari PDF. Filemu tidak diunggah ke mana pun."
      accept="application/pdf,.pdf"
      multiple
      mode="each"
      defaultOptions={{ password: '' }}
      Options={Options}
      actionLabel={(n) => `Buka kunci ${n} file`}
      canRun={(o) => (o.password ? null : 'Isi password PDF-nya dulu.')}
    />
  )
}
