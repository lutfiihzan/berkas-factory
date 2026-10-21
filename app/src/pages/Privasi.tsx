import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const h2 = 'mt-10 text-xl font-bold text-navy-900'
const p = 'mt-3 leading-relaxed text-navy-700'
const ul = 'mt-3 list-disc space-y-2 pl-6 leading-relaxed text-navy-700'

export default function Privasi() {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <main><header className="bg-gradient-to-b from-navy-900 to-navy-800 px-4 py-12 text-center"><div className="mx-auto max-w-3xl"><Link to="/" className="text-sm text-navy-200 hover:text-white hover:underline">&larr; Kembali ke beranda</Link><h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white">Privasi</h1></div></header><div className="mx-auto max-w-3xl px-4 py-10"><div className="rounded-3xl bg-white p-6 shadow-card sm:p-10">
      <p className={p}>Singkatnya: filemu tidak pernah meninggalkan perangkatmu. Berikut rinciannya, termasuk yang tidak bisa kami janjikan.</p>

      <h2 className={h2}>Yang diproses</h2>
      <p className={p}>
        Semua tool bekerja di browsermu, sebagian lewat Web Worker. Tidak ada endpoint untuk mengunggah file di aplikasi ini. File yang kamu pilih hanya ada di memori tab; begitu tab ditutup atau dimuat ulang, file itu hilang. Hasil proses baru jadi file di perangkatmu saat kamu menekan Download.
      </p>
      <p className={p}>
        Halaman ini juga dipasangi Content Security Policy yang membatasi koneksi hanya ke alamat sendiri (<code className="rounded bg-navy-50 px-1.5 py-0.5 text-sm text-navy-800">connect-src 'self' blob: data:</code>), jadi kode di halaman tidak bisa mengirim data ke domain lain.
      </p>

      <h2 className={h2}>Yang tersimpan di perangkatmu</h2>
      <ul className={ul}>
        <li>Tombol "Kabari aku" menyimpan satu penanda (<code className="rounded bg-navy-50 px-1.5 py-0.5 text-sm text-navy-800">notify = 1</code>) di localStorage browsermu, supaya tombolnya tahu kamu sudah menekannya. Penanda ini tidak dikirim ke mana pun.</li>
        <li>Di versi produksi, service worker menyimpan kode aplikasi (halaman, skrip, font) di cache browser supaya bisa dipakai offline setelah kunjungan pertama. Yang di-cache hanya berkas aplikasi, bukan file milikmu. Tidak ada cookie, dan isi file tidak pernah ditulis ke localStorage.</li>
      </ul>
      <p className={p}>Kamu bisa menghapus penanda itu kapan saja lewat pengaturan data situs di browser.</p>

      <h2 className={h2}>Analitik</h2>
      <p className={p}>
        Saat ini tidak ada analitik sama sekali. Kalau nanti ditambahkan, yang dihitung hanya angka agregat (misalnya berapa kali sebuah tool dipakai), tanpa nama atau isi file, dan halaman ini akan diperbarui lebih dulu.
      </p>

      <h2 className={h2}>Form masukan</h2>
      <p className={p}>
        Yang terkirim hanya teks yang kamu ketik di form: jenis masukan, pesan, dan email kalau kamu mau mengisinya (opsional). File tidak ikut. Saat ini form membuka aplikasi emailmu dengan pesan yang sudah terisi (mailto), jadi kamu bisa membaca dan mengubahnya sebelum mengirim.
      </p>

      <h2 className={h2}>Buktikan sendiri</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-6 leading-relaxed text-navy-700">
        <li>Buka sebuah tool, lalu aktifkan mode pesawat atau putuskan internet. Tool tetap jalan.</li>
        <li>Atau buka DevTools (F12), pindah ke tab Network, lalu proses sebuah file. Tidak akan ada request yang membawa file.</li>
        <li>Kamu juga bisa membaca tag CSP di source halaman.</li>
      </ol>

      <h2 className={h2}>Keterbatasan</h2>
      <ul className={ul}>
        <li>Kami tidak bisa mengendalikan perangkatmu: ekstensi browser, malware, atau komputer bersama bisa melihat apa yang kamu buka.</li>
        <li>File yang sangat besar bisa membuat tab kehabisan memori.</li>
        <li>File hasil yang kamu unduh tersimpan di folder unduhanmu; menghapusnya jadi urusanmu.</li>
        <li>Server yang menyajikan situs ini bisa mencatat kunjungan standar (alamat IP, waktu akses) seperti server web pada umumnya. Itu soal halaman yang dimuat, bukan isi filemu.</li>
      </ul>

      <h2 className={h2}>Kontak</h2>
      <p className={p}>Ada pertanyaan soal privasi? Pakai tombol "Kasih masukan" di pojok kanan bawah.</p>
    </div></div></main>
  )
}
