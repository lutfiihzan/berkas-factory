import PagePreview from '../../components/PagePreview'
import ToolPage,{ type OptionsProps } from '../../components/ToolPage'
import { Field, inputCls } from '../../components/tool/controls'

export interface Opts {
  position: 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-left' | 'top-center' | 'top-right'
  format: 'n' | 'halaman' | 'n-of-total'
  startNumber: number
  startPage: number
  fontSize: number
}

const defaults: Opts = { position: 'bottom-center', format: 'n', startNumber: 1, startPage: 1, fontSize: 11 }

// Meniru run.ts: margin 28 poin, teks Helvetica hitam, digambar di SVG ber-viewBox ukuran halaman.
function NumberOverlay({ o, page, numPages, pageW, pageH }: { o: Opts; page: number; numPages: number | null; pageW: number; pageH: number }) {
  const first = Math.max(1, o.startPage)
  if (page < first) return null
  const n = o.startNumber + (page - first)
  const total = o.startNumber + Math.max(0, (numPages ?? page) - first)
  const text = o.format === 'halaman' ? `Halaman ${n}` : o.format === 'n-of-total' ? `${n} / ${total}` : String(n)
  const m = 28
  const [v, h] = o.position.split('-')
  const x = h === 'left' ? m : h === 'right' ? pageW - m : pageW / 2
  const y = v === 'bottom' ? pageH - m : m + o.fontSize
  return (
    <svg viewBox={`0 0 ${pageW} ${pageH}`} className="h-full w-full" aria-hidden>
      <text x={x} y={y} fontSize={o.fontSize} fontFamily="Helvetica, Arial, sans-serif" fill="#000"
        textAnchor={h === 'left' ? 'start' : h === 'right' ? 'end' : 'middle'}>{text}</text>
    </svg>
  )
}

function Options({ value, onChange, files }: OptionsProps<Opts>) {
  const set = (p: Partial<Opts>) => onChange({ ...value, ...p })
  const num = (v: string, d: number) => (Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : d)
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto]">
    <div className="order-2 grid gap-4 sm:grid-cols-2 md:order-1">
      <Field label="Posisi">
        <select className={inputCls} value={value.position} onChange={(e) => set({ position: e.target.value as Opts['position'] })}>
          <option value="bottom-left">Bawah kiri</option>
          <option value="bottom-center">Bawah tengah</option>
          <option value="bottom-right">Bawah kanan</option>
          <option value="top-left">Atas kiri</option>
          <option value="top-center">Atas tengah</option>
          <option value="top-right">Atas kanan</option>
        </select>
      </Field>
      <Field label="Format">
        <select className={inputCls} value={value.format} onChange={(e) => set({ format: e.target.value as Opts['format'] })}>
          <option value="n">1</option>
          <option value="halaman">Halaman 1</option>
          <option value="n-of-total">1 / N</option>
        </select>
      </Field>
      <Field label="Mulai dari nomor">
        <input type="number" min={0} className={inputCls} value={value.startNumber} onChange={(e) => set({ startNumber: num(e.target.value, 1) })} />
      </Field>
      <Field label="Mulai di halaman ke-">
        <input type="number" min={1} className={inputCls} value={value.startPage} onChange={(e) => set({ startPage: Math.max(1, num(e.target.value, 1)) })} />
      </Field>
      <Field label="Ukuran font">
        <input type="number" min={6} max={48} className={inputCls} value={value.fontSize} onChange={(e) => set({ fontSize: num(e.target.value, 11) })} />
      </Field>
    </div>
    <div className="order-1 md:order-2 md:w-[260px]">
      <PagePreview files={files} caption="Perkiraan hasil untuk file pertama.">
        {(i) => <NumberOverlay o={value} page={i.page} numPages={i.numPages} pageW={i.pageW} pageH={i.pageH} />}
      </PagePreview>
    </div>
    </div>
  )
}

export default function Page() {
  return (
    <ToolPage<Opts>
      toolId="page-numbers"
      title="Nomor Halaman PDF"
      blurb="Tambah nomor di setiap halaman. Pilih posisi, format, dan mulai dari nomor berapa."
      accept="application/pdf,.pdf"
      multiple
      mode="each"
      defaultOptions={defaults}
      Options={Options}
      actionLabel={(n) => `Beri nomor ${n} file`}
    />
  )
}
