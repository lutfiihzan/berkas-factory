import ToolPage, { type OptionsProps } from '../../components/ToolPage'
import { Field, Note, selectCls } from '../../components/tool/controls'

export interface Opts {
  level: 'ringan' | 'sedang' | 'kuat'
  maxSide: number
  format: 'same' | 'jpg' | 'webp'
}

const defaults: Opts = { level: 'sedang', maxSide: 0, format: 'same' }

function Options({ value, onChange }: OptionsProps<Opts>) {
  const set = (p: Partial<Opts>) => onChange({ ...value, ...p })
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Field label="Tingkat kompres">
        <select className={selectCls} value={value.level} onChange={(e) => set({ level: e.target.value as Opts['level'] })}>
          <option value="ringan">Ringan (kualitas 85%)</option>
          <option value="sedang">Sedang (kualitas 70%)</option>
          <option value="kuat">Kuat (kualitas 50%)</option>
        </select>
      </Field>
      <Field label="Sisi terpanjang maksimal">
        <select className={selectCls} value={value.maxSide} onChange={(e) => set({ maxSide: Number(e.target.value) })}>
          <option value={0}>Tanpa batas</option>
          <option value={2560}>2560 px</option>
          <option value={1600}>1600 px</option>
          <option value={1024}>1024 px</option>
        </select>
      </Field>
      <Field label="Format hasil">
        <select className={selectCls} value={value.format} onChange={(e) => set({ format: e.target.value as Opts['format'] })}>
          <option value="same">Sama dengan aslinya</option>
          <option value="jpg">JPG</option>
          <option value="webp">WebP</option>
        </select>
      </Field>
      <Note className="sm:col-span-3">
        PNG bertransparansi tetap PNG kecuali kamu pilih WebP. Kalau hasilnya tidak lebih kecil, file asli yang dikembalikan.
        PNG hasil screenshot atau grafis biasanya baru turun jauh kalau dimensinya diperkecil.
      </Note>
    </div>
  )
}

export default function Page() {
  return (
    <ToolPage<Opts>
      toolId="image-compress"
      title="Kompres gambar"
      blurb="Kecilkan ukuran foto tanpa upload. Semuanya diproses di perangkatmu."
      accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
      multiple
      mode="each"
      defaultOptions={defaults}
      Options={Options}
      actionLabel={(n) => `Kompres ${n} gambar`}
    />
  )
}
