import { useEffect, useState } from 'react'
import { usePreview } from '../../lib/thumbs'
import ToolPage,{ type OptionsProps } from '../../components/ToolPage'
import { Field, selectCls } from '../../components/tool/controls'

export interface Opts {
  size: 'fit' | 'a4' | 'letter'
  orientation: 'auto' | 'portrait' | 'landscape'
  margin: 'none' | 'small' | 'medium'
}

const defaults: Opts = { size: 'fit', orientation: 'auto', margin: 'none' }

const SIZES = { a4: [595.28, 841.89], letter: [612, 792] } as const
const MARGINS = { none: 0, small: 18, medium: 36 } as const

// Ilustrasi tata letak halaman, mengikuti perhitungan di run.ts.
function LayoutPreview({ file, o }: { file: File | undefined; o: Opts }) {
  const src = usePreview(file, 1, 260)
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null)
  useEffect(() => { setNat(null) }, [file])
  if (!file) {
    return <div className="rounded-xl border border-dashed border-navy-200 bg-navy-50 p-5 text-center text-xs text-navy-500">Pilih gambar dulu untuk lihat pratinjau.</div>
  }
  const iw = nat?.w ?? 4
  const ih = nat?.h ?? 3
  const m = MARGINS[o.margin]
  let pw: number
  let ph: number
  if (o.size === 'fit') {
    pw = iw + m * 2
    ph = ih + m * 2
  } else {
    const [bw, bh] = SIZES[o.size]
    const landscape = o.orientation === 'auto' ? iw > ih : o.orientation === 'landscape'
    pw = landscape ? bh : bw
    ph = landscape ? bw : bh
  }
  const mp = (m / pw) * 100
  const mv = (m / ph) * 100
  return (
    <div className="mx-auto w-full" style={{ maxWidth: pw >= ph ? 260 : Math.round(260 * (pw / ph) + 40) }}>
      <div className="relative w-full bg-white shadow-card ring-1 ring-navy-200" style={{ aspectRatio: `${pw} / ${ph}` }}>
        <div className="absolute" style={{ left: `${mp}%`, right: `${mp}%`, top: `${mv}%`, bottom: `${mv}%` }}>
          <div className="flex h-full w-full items-center justify-center bg-navy-50">
            {src === null && <div className="h-full w-full animate-pulse bg-navy-100" />}
            {src && (
              <img src={src} alt="Gambar pertama" draggable={false} className="max-h-full max-w-full object-contain"
                onLoad={(e) => setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })} />
            )}
          </div>
        </div>
      </div>
      <p className="mt-1 text-center text-xs text-navy-500">
        Halaman {o.size === 'fit' ? 'sesuai gambar' : o.size === 'a4' ? 'A4' : 'Letter'}, {pw >= ph ? 'landscape' : 'portrait'}. Gambar pertama.
      </p>
    </div>
  )
}

function Options({ value, onChange, files }: OptionsProps<Opts>) {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto]">
    <div className="order-2 grid gap-4 sm:grid-cols-3 md:order-1">
      <Field label="Ukuran halaman">
        <select className={selectCls} value={value.size} onChange={(e) => onChange({ ...value, size: e.target.value as Opts['size'] })}>
          <option value="fit">Sesuai gambar</option>
          <option value="a4">A4</option>
          <option value="letter">Letter</option>
        </select>
      </Field>
      <Field label="Orientasi">
        <select
          className={selectCls}
          value={value.orientation}
          disabled={value.size === 'fit'}
          onChange={(e) => onChange({ ...value, orientation: e.target.value as Opts['orientation'] })}
        >
          <option value="auto">Otomatis</option>
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </Field>
      <Field label="Margin">
        <select className={selectCls} value={value.margin} onChange={(e) => onChange({ ...value, margin: e.target.value as Opts['margin'] })}>
          <option value="none">Tanpa margin</option>
          <option value="small">Kecil</option>
          <option value="medium">Sedang</option>
        </select>
      </Field>
    </div>
    <div className="order-1 md:order-2 md:w-[260px]">
      <LayoutPreview file={files[0]} o={value} />
    </div>
    </div>
  )
}

export default function Page() {
  return (
    <ToolPage<Opts>
      toolId="image-to-pdf"
      title="JPG ke PDF"
      blurb="Gabung gambar jadi satu PDF. Satu gambar satu halaman, urutannya sesuai daftar."
      accept="image/jpeg,image/png,.jpg,.jpeg,.png"
      multiple
      mode="combine"
      defaultOptions={defaults}
      Options={Options}
      actionLabel={(n) => `Buat PDF dari ${n} gambar`}
    />
  )
}
