import ToolPage from '../../components/ToolPage'
import { Note } from '../../components/tool/controls'

export default function Page() {
  return (
    <ToolPage
      toolId="repair"
      title="Perbaiki file"
      blurb="PDF yang tidak mau terbuka, kita coba selamatkan isinya. Hasilnya disimpan sebagai file baru berakhiran -pulih."
      accept="application/pdf,.pdf"
      multiple
      mode="each"
      defaultOptions={{}}
      Options={() => (
        <Note tone="warn">
          Ini masih tahap uji coba dan tidak ada jaminan. Kerusakan ringan (daftar isi file rusak, ada sampah di awal, ujung file
          terpotong) sering bisa dipulihkan. File yang sebagian besar isinya hilang atau halamannya tersimpan di bagian yang hilang
          biasanya tidak bisa. Kalau gagal, kamu akan diberi tahu apa adanya.
        </Note>
      )}
      actionLabel={(n) => `Coba perbaiki ${n} file`}
    />
  )
}
