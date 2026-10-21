import ToolPage, { type OptionsProps } from '../../components/ToolPage'
import { Field, selectCls } from '../../components/tool/controls'

interface Opts { format: 'jpg' | 'png'; dpi: 72 | 150 | 220 }

function Options({ value, onChange }: OptionsProps<Opts>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Format">
        <select className={selectCls} value={value.format} onChange={(e) => onChange({ ...value, format: e.target.value as Opts['format'] })}>
          <option value="jpg">JPG (lebih kecil)</option>
          <option value="png">PNG (lebih tajam)</option>
        </select>
      </Field>
      <Field label="Kualitas">
        <select className={selectCls} value={value.dpi} onChange={(e) => onChange({ ...value, dpi: Number(e.target.value) as Opts['dpi'] })}>
          <option value={72}>72 DPI (layar)</option>
          <option value={150}>150 DPI (standar)</option>
          <option value={220}>220 DPI (tajam)</option>
        </select>
      </Field>
    </div>
  )
}

export default function Page() {
  return (
    <ToolPage<Opts>
      toolId="pdf-to-image"
      title="PDF ke JPG"
      blurb="Tiap halaman jadi satu gambar. Kalau halamannya banyak, hasilnya dibungkus ZIP."
      accept="application/pdf,.pdf"
      multiple
      mode="each"
      defaultOptions={{ format: 'jpg', dpi: 150 }}
      Options={Options}
      actionLabel={(n) => `Ubah ${n} file`}
    />
  )
}
