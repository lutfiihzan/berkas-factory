export const faq: [string, string][] = [
  ['Beneran nggak ada yang di-upload?', 'Beneran. Kamu bisa cek sendiri di tab Network, atau coba pakai dalam mode pesawat. Langkahnya ada di atas.'],
  ['Kenapa gratis?', 'Karena pemrosesan terjadi di perangkatmu, biaya server kami kecil.'],
  ['Ukuran file maksimal?', 'Tidak ada batas dari kami. Batasnya memori perangkatmu. Di laptop biasa, file sampai sekitar 200 MB aman. Di atas 300 MB kami kasih peringatan.'],
  ['Hasil kompres kok kurang kecil?', 'Tergantung isi PDF. File hasil scan bisa mengecil banyak, file teks murni biasanya sudah ramping. Mode "kuat" mengubah halaman jadi gambar, jadi teksnya tidak bisa diseleksi lagi. Peringatannya muncul sebelum kamu proses.'],
  ['Bisa ubah Word/Excel jadi PDF?', 'Belum. Hasilnya di browser belum cukup rapi untuk kami rilis. Kalau sudah, kami kabari di sini.'],
  ['Kalau tab ditutup, filenya hilang?', 'Ya, dan itu disengaja. Tidak ada yang tersimpan. Unduh hasilnya sebelum menutup tab.'],
  ['Bisa dipakai di HP?', 'Bisa, tapi file besar lebih nyaman di laptop.'],
  ['Mau request tool atau lapor bug, ke mana?', 'Klik bubble hijau "Kasih masukan" di pojok kanan bawah, tulis pesanmu, lalu lanjut lewat WhatsApp. Yang terkirim cuma tulisanmu dan alamat halaman, bukan filenya. Tool yang banyak diminta naik ke daftar kerja.'],
]

export default function Faq() {
  return (
    <section id="faq" className="scroll-mt-16 bg-white px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-navy-900">Pertanyaan yang sering muncul</h2>
        <div className="mt-8 space-y-3">
          {faq.map(([q, a]) => (
            <details key={q} className="group rounded-2xl bg-navy-50 p-5 open:bg-white open:shadow-card">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-navy-900 [&::-webkit-details-marker]:hidden">
                {q}
                <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-brand-600 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 8l5 5 5-5" />
                </svg>
              </summary>
              <p className="mt-3 text-navy-700">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
