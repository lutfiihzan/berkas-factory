import ToolPage, { type OptionsProps } from '../../components/ToolPage'
import { Note, RadioCards } from '../../components/tool/controls'

type Level = 'ringan' | 'sedang' | 'kuat'
interface Opts { level: Level }

const LEVELS: { id: Level; label: string; hint: string }[] = [
  { id: 'ringan', label: 'Ringan', hint: 'Kualitas tinggi, ukuran turun sedikit' },
  { id: 'sedang', label: 'Sedang', hint: 'Seimbang' },
  { id: 'kuat', label: 'Kuat', hint: 'Ukuran paling kecil, kualitas turun' },
]

function Options({ value, onChange }: OptionsProps<Opts>) {
  return (
    <div className="space-y-4">
      <RadioCards name="level" options={LEVELS} value={value.level} onChange={(level) => onChange({ level })} />
      <Note tone="warn">
        Perhatian: tiap halaman diubah jadi gambar, jadi teks di dalamnya tidak bisa diseleksi atau dicari lagi. Kalau hasilnya
        malah lebih besar dari file asli, kamu akan mendapat file asli.
      </Note>
    </div>
  )
}

export default function Page() {
  return (
    <ToolPage<Opts>
      toolId="compress"
      title="Kompres PDF"
      blurb="Perkecil ukuran PDF. Semua diproses di browser kamu, file tidak diunggah."
      accept="application/pdf,.pdf"
      multiple
      mode="each"
      defaultOptions={{ level: 'sedang' }}
      Options={Options}
      actionLabel={(n) => `Kompres ${n} file`}
    />
  )
}
