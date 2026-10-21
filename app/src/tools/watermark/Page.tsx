import PagePreview from '../../components/PagePreview'
import ToolPage,{ type OptionsProps } from '../../components/ToolPage'
import { Field, inputCls, sliderCls } from '../../components/tool/controls'

export interface Opts {
  text: string
  size: number
  color: string
  opacity: number
  rotation: number
  layout: 'center' | 'tile'
}

const defaults: Opts = { text: 'RAHASIA', size: 60, color: '#888888', opacity: 0.3, rotation: 45, layout: 'center' }

let measureCtx: CanvasRenderingContext2D | null | undefined
// lebar teks Helvetica-Bold pada ukuran `size` (pendekatan lewat canvas)
function textWidth(text: string, size: number) {
  if (measureCtx === undefined) measureCtx = document.createElement('canvas').getContext('2d')
  if (!measureCtx) return text.length * size * 0.6
  measureCtx.font = 'bold 100px Helvetica, Arial, sans-serif'
  return (measureCtx.measureText(text).width / 100) * size
}

// Meniru run.ts: koordinat dalam poin PDF (sumbu y ke atas), digambar di SVG ber-viewBox ukuran halaman.
function WatermarkOverlay({ o, pageW, pageH }: { o: Opts; pageW: number; pageH: number }) {
  const text = o.text.trim()
  if (!text || !(o.size > 0)) return null
  const tw = textWidth(text, o.size)
  const th = o.size * 0.7
  const spots: Array<[number, number]> = []
  if (o.layout === 'center') spots.push([pageW / 2, pageH / 2])
  else {
    const stepX = tw + o.size
    const stepY = o.size * 3
    let row = 0
    for (let y = stepY / 2; y < pageH + stepY && spots.length < 1500; y += stepY, row++) {
      for (let x = row % 2 ? stepX / 2 : 0; x < pageW + stepX && spots.length < 1500; x += stepX) spots.push([x, y])
    }
  }
  return (
    <svg viewBox={`0 0 ${pageW} ${pageH}`} className="h-full w-full" aria-hidden>
      {spots.map(([cx, cy], i) => {
        const sy = pageH - cy
        return (
          <text key={i} x={cx} y={sy + th / 2} textAnchor="middle" fontFamily="Helvetica, Arial, sans-serif" fontWeight="bold"
            fontSize={o.size} fill={o.color} fillOpacity={o.opacity} transform={`rotate(${-o.rotation} ${cx} ${sy})`}>
            {text}
          </text>
        )
      })}
    </svg>
  )
}

function Options({ value, onChange, files }: OptionsProps<Opts>) {
  const set = (p: Partial<Opts>) => onChange({ ...value, ...p })
  const num = (v: string, d: number) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : d)
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto]">
    <div className="order-2 grid gap-4 sm:grid-cols-2 md:order-1">
      <Field label="Teks watermark" className="sm:col-span-2">
        <input className={inputCls} value={value.text} onChange={(e) => set({ text: e.target.value })} />
      </Field>
      <Field label="Ukuran font">
        <input type="number" min={6} max={300} className={inputCls} value={value.size} onChange={(e) => set({ size: num(e.target.value, 60) })} />
      </Field>
      <Field label="Warna">
        <input type="color" className={inputCls + ' h-11 cursor-pointer p-1'} value={value.color} onChange={(e) => set({ color: e.target.value })} />
      </Field>
      <Field label={`Opasitas: ${Math.round(value.opacity * 100)}%`}>
        <input type="range" min={5} max={100} className={sliderCls} value={Math.round(value.opacity * 100)} onChange={(e) => set({ opacity: num(e.target.value, 30) / 100 })} />
      </Field>
      <Field label="Rotasi (derajat)">
        <input type="number" min={-180} max={180} className={inputCls} value={value.rotation} onChange={(e) => set({ rotation: num(e.target.value, 45) })} />
      </Field>
      <Field label="Posisi" className="sm:col-span-2">
        <select className={inputCls} value={value.layout} onChange={(e) => set({ layout: e.target.value as Opts['layout'] })}>
          <option value="center">Di tengah halaman</option>
          <option value="tile">Berulang memenuhi halaman</option>
        </select>
      </Field>
    </div>
    <div className="order-1 md:order-2 md:w-[260px]">
      <PagePreview files={files} caption="Perkiraan hasil untuk file pertama.">
        {({ pageW, pageH }) => <WatermarkOverlay o={value} pageW={pageW} pageH={pageH} />}
      </PagePreview>
    </div>
    </div>
  )
}

export default function Page() {
  return (
    <ToolPage<Opts>
      toolId="watermark"
      title="Watermark PDF"
      blurb="Tempel teks watermark di setiap halaman. Atur ukuran, warna, dan seberapa transparan."
      accept="application/pdf,.pdf"
      multiple
      mode="each"
      defaultOptions={defaults}
      Options={Options}
      actionLabel={(n) => `Beri watermark ${n} file`}
    />
  )
}
