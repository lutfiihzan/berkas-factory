import PagePreview from '../../components/PagePreview'
import ToolPage,{ type OptionsProps } from '../../components/ToolPage'
import { RadioCards, RadioRow, inputCls } from '../../components/tool/controls'
import type { RotateOptions } from './run'

function Options({ value, onChange, files }: OptionsProps<RotateOptions>) {
  const set = (p: Partial<RotateOptions>) => onChange({ ...value, ...p })
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_auto]">
    <div className="order-2 space-y-5 text-sm md:order-1">
      <div>
        <p className="mb-2 font-medium text-navy-800">Arah putar</p>
        <RadioCards<90 | 180 | 270>
          name="angle"
          value={value.angle}
          onChange={(angle) => set({ angle })}
          options={[
            { id: 90, label: '90°', hint: 'Searah jarum jam' },
            { id: 180, label: '180°', hint: 'Dibalik' },
            { id: 270, label: '270°', hint: '90° berlawanan jarum jam' },
          ]}
        />
      </div>
      <div className="space-y-2">
        <p className="font-medium text-navy-800">Halaman yang diputar</p>
        <RadioRow checked={value.scope === 'all'} onChange={() => set({ scope: 'all' })}>Semua halaman</RadioRow>
        <RadioRow checked={value.scope === 'range'} onChange={() => set({ scope: 'range' })}>Halaman tertentu saja</RadioRow>
        {value.scope === 'range' && (
          <input className={inputCls} value={value.range} placeholder="1-3,5,8-" onChange={(e) => set({ range: e.target.value })} />
        )}
      </div>
    </div>
    <div className="order-1 md:order-2 md:w-[200px]">
      <PagePreview files={files} width={200} rotate={value.angle}
        caption={value.scope === 'range' ? 'Contoh putaran. Hanya halaman di rentang yang diputar.' : 'Contoh putaran untuk file pertama.'} />
    </div>
    </div>
  )
}

export default function Page() {
  return (
    <ToolPage<RotateOptions>
      toolId="rotate"
      title="Putar PDF"
      blurb="Putar halaman yang miring. Bisa banyak file sekaligus, tiap file jadi file baru."
      accept="application/pdf,.pdf"
      multiple
      mode="each"
      defaultOptions={{ angle: 90, scope: 'all', range: '' }}
      Options={Options}
      actionLabel={(n) => `Putar ${n} file`}
    />
  )
}
