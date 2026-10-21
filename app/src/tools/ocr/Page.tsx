import ToolPage, { type OptionsProps } from '../../components/ToolPage'
import { Field, Note, selectCls } from '../../components/tool/controls'

export interface Opts {
  lang: 'ind+eng' | 'ind' | 'eng'
  format: 'txt' | 'pdf'
}

const defaults: Opts = { lang: 'ind+eng', format: 'txt' }

function Options({ value, onChange }: OptionsProps<Opts>) {
  const set = (p: Partial<Opts>) => onChange({ ...value, ...p })
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Bahasa">
        <select className={selectCls} value={value.lang} onChange={(e) => set({ lang: e.target.value as Opts['lang'] })}>
          <option value="ind+eng">Indonesia + Inggris</option>
          <option value="ind">Indonesia</option>
          <option value="eng">Inggris</option>
        </select>
      </Field>
      <Field label="Format hasil">
        <select className={selectCls} value={value.format} onChange={(e) => set({ format: e.target.value as Opts['format'] })}>
          <option value="txt">Teks (.txt)</option>
          <option value="pdf">PDF yang bisa dicari (gambar + teks tak terlihat)</option>
        </select>
      </Field>
      <Note className="sm:col-span-2">
        Pertama kali dipakai, mesin OCR (sekitar 10 MB) diunduh sekali lalu disimpan di perangkatmu. Akurasi bergantung
        kualitas gambar: pakai gambar tajam, lurus, dan terang. Tulisan tangan tidak didukung dengan baik. PDF di-render
        sekitar 200 DPI, jadi file besar dan banyak halaman bisa lama.
      </Note>
    </div>
  )
}

export default function Page() {
  return (
    <ToolPage<Opts>
      toolId="ocr"
      title="OCR: teks dari gambar/scan"
      blurb="Ubah foto atau hasil scan jadi teks yang bisa disalin, tanpa upload. Semuanya diproses di perangkatmu."
      accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf"
      multiple
      mode="each"
      defaultOptions={defaults}
      Options={Options}
      actionLabel={(n) => `Kenali teks ${n} file`}
    />
  )
}
