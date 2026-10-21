import ToolPage from '../../components/ToolPage'

export default function Page() {
  return (
    <ToolPage
      toolId="merge"
      title="Gabung PDF"
      blurb="Susun beberapa file jadi satu. Seret kartu atau pakai tombol panah untuk mengatur urutan."
      accept="application/pdf,.pdf"
      multiple
      mode="combine"
      defaultOptions={{}}
      actionLabel={(n) => `Gabung ${n} file`}
    />
  )
}
