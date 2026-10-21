import ToolPage, { type OptionsProps } from '../../components/ToolPage'
import { Checkbox, Field, Note, inputCls, selectCls } from '../../components/tool/controls'

export interface Opts {
  bg: 'transparent' | 'white' | 'color'
  color: string
  smooth: boolean
}

const defaults: Opts = { bg: 'transparent', color: '#2563eb', smooth: true }

function Options({ value, onChange }: OptionsProps<Opts>) {
  const set = (p: Partial<Opts>) => onChange({ ...value, ...p })
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Latar belakang">
        <select className={selectCls} value={value.bg} onChange={(e) => set({ bg: e.target.value as Opts['bg'] })}>
          <option value="transparent">Transparan</option>
          <option value="white">Putih</option>
          <option value="color">Warna sendiri</option>
        </select>
      </Field>
      {value.bg === 'color' && (
        <Field label="Warna latar">
          <input type="color" className={inputCls + ' h-11 cursor-pointer p-1'} value={value.color} onChange={(e) => set({ color: e.target.value })} />
        </Field>
      )}
      <div className="sm:col-span-2">
        <Checkbox checked={value.smooth} onChange={(smooth) => set({ smooth })}>Haluskan tepi</Checkbox>
      </div>
      <Note className="sm:col-span-2">
        Model ini paling bagus untuk foto orang atau potret. Benda dan produk bisa kurang rapi di tepinya. Model (sekitar 40 MB total) diunduh sekali lalu disimpan di browser, fotomu tidak pernah dikirim ke mana-mana.
      </Note>
    </div>
  )
}

export default function Page() {
  return (
    <ToolPage<Opts>
      toolId="remove-bg"
      title="Hapus background"
      blurb="Pisahkan orang dari latar fotonya, hasilnya PNG transparan. Semua diproses di browsermu."
      accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
      multiple
      mode="each"
      defaultOptions={defaults}
      Options={Options}
      actionLabel={(n) => `Hapus background ${n} foto`}
    />
  )
}
