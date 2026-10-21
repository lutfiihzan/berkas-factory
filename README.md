# BerkasFactory

Alat berkas yang jalan di browsermu. **Filemu nggak ke mana-mana.**

Gabung, pisah, kompres, ubah, beri watermark, kunci PDF, OCR, sampai hapus background foto. Semua diproses di browser (Web Worker dan WebAssembly), jadi file tidak pernah diunggah ke server.

**Coba:** https://tools.senikode.com &nbsp;·&nbsp; **Status: beta**, masukan sangat dibutuhkan.

## Isi

| Tool | Slug | Status |
|---|---|---|
| Gabung PDF | `/gabung-pdf` | stabil |
| Pisah PDF | `/pisah-pdf` | stabil |
| Putar PDF | `/putar-pdf` | stabil |
| Atur halaman PDF | `/atur-halaman-pdf` | stabil |
| Kompres PDF | `/kompres-pdf` | stabil |
| PDF ke JPG/PNG | `/pdf-ke-jpg` | stabil |
| JPG/PNG ke PDF | `/jpg-ke-pdf` | stabil |
| Watermark PDF | `/watermark-pdf` | stabil |
| Nomor halaman PDF | `/nomor-halaman-pdf` | stabil |
| Kunci PDF | `/kunci-pdf` | stabil |
| Buka kunci PDF | `/buka-kunci-pdf` | stabil |
| Kompres gambar | `/kompres-gambar` | stabil |
| OCR (teks dari gambar/scan) | `/ocr` | Lab |
| Hapus background | `/hapus-background` | Lab |
| Perbaiki file (PDF rusak) | `/perbaiki-file` | Lab |

Fitur umum: banyak file atau satu folder sekaligus (antrean per file, hasil sebagai ZIP, satu file gagal tidak menghentikan yang lain), drag & drop ke mana saja di halaman, paste (Ctrl+V), thumbnail halaman, undo/redo (Ctrl+Z), command palette (Ctrl+K), dan progress bar.

## Cara privasinya bekerja

- Setiap tool berjalan di Web Worker di browsermu. File dibaca dari perangkat, diproses di memori, lalu hasilnya kamu unduh.
- Server hanya menyajikan berkas statis (HTML, JS, WASM, model). Tidak ada endpoint yang menerima file.
- CSP (`index.html`) membatasi `connect-src` ke `'self'`, sehingga kode aplikasi tidak bisa mengirim data ke domain lain.
- Model OCR (Tesseract) dan hapus background (MODNet) di-host sendiri, tidak diambil dari CDN.
- Tidak ada cookie pelacak dan tidak ada analitik. Cache offline (service worker) hanya aktif setelah pengunjung menekan "Terima" di banner cookie.
- Tombol "Kasih masukan" membuka WhatsApp dengan pesan terisi. Yang ikut hanya teks yang diketik dan alamat halaman, tidak pernah nama atau isi file.

Cara membuktikan sendiri: buka DevTools (F12) → tab Network, lalu proses sebuah file. Tidak ada request yang membawa file. Ada juga uji otomatis, lihat bagian Pengujian.

## Teknologi

React 19 · TypeScript · Vite · Tailwind CSS v4 · react-router · Web Worker + WebAssembly

| Kebutuhan | Pustaka | Lisensi |
|---|---|---|
| Manipulasi PDF | `pdf-lib`, `@cantoo/pdf-lib` (enkripsi) | MIT |
| Render PDF | `pdfjs-dist` | Apache-2.0 |
| OCR | `tesseract.js` + data bahasa `tessdata_fast` (Indonesia, Inggris) | Apache-2.0 |
| Hapus background | `onnxruntime-web` + model MODNet | MIT / Apache-2.0 |
| ZIP | `fflate` | MIT |

Pustaka berlisensi AGPL/GPL dan model dengan lisensi non-komersial sengaja dihindari.

## Menjalankan di komputer

Butuh Node.js 22 (diuji dengan 22.16). Semua perintah dijalankan dari folder `app/`.

```bash
cd app
npm install
npm run dev        # http://localhost:5173
```

| Perintah | Fungsi |
|---|---|
| `npm run dev` | server pengembangan |
| `npm run build` | typecheck lalu build produksi ke `dist/` |
| `npm run preview` | menjalankan hasil build |
| `npm run lint` | oxlint |
| `npm run test:privacy` | uji nol-upload (lihat di bawah) |
| `npm run sitemap` | membuat `public/sitemap.xml` dari daftar tool |
| `npm run icons` | membuat ikon PNG/ICO dari `public/favicon.svg` dan `public/icon.svg` |
| `npm run assets:ocr` | menyalin mesin Tesseract dari `node_modules` ke `public/tesseract/` |
| `npm run assets:ort` | menyalin WASM ONNX Runtime ke `public/ort/` |

Berkas model dan data bahasa ikut ada di repo: `public/models/modnet.onnx` (25,9 MB), `public/tessdata/*.traineddata`, dan `public/ort`, `public/tesseract`.

## Struktur

```
app/
  src/
    registry/      daftar tool otomatis (import.meta.glob dari manifest.ts)
    tools/<id>/    manifest.ts, Page.tsx, run.ts untuk tiap tool
    components/    ToolPage (halaman tool generik), tool/ (kartu file, progress, hasil), shell/ (header)
    workers/       task.worker.ts: menjalankan run.ts tool di Web Worker
    lib/           runTask, thumbs, fsAccess, consent, seo, ...
    pages/         landing, Privasi, Tentang
  public/          aset statis, model, ikon, sw.js, manifest
  scripts/         pembuat sitemap, ikon, dan penyalin aset
  e2e/             uji nol-upload (Playwright)
```

## Menambah tool baru

Satu tool = satu folder di `app/src/tools/<id>/`. Tidak perlu mengedit file bersama; registry menemukannya otomatis.

1. `manifest.ts`: id, slug, nama, deskripsi, kategori, status (`stable`, `lab`, atau `coming-soon`), dan `Page` (lazy).
2. `run.ts`: `export const run: RunFn = async (inputs, options, { progress }) => OutputFile[]`. Berjalan di Web Worker (tanpa DOM; `OffscreenCanvas` boleh).
3. `Page.tsx`: memakai `ToolPage` dengan `mode` (`'combine'` = N file jadi 1 hasil, `'each'` = N file jadi N hasil), opsi, dan label tombol.

Contoh paling sederhana: `app/src/tools/merge/`. Tool baru wajib lolos `npm run test:privacy` (tambahkan ke daftar di `app/e2e/no-upload.mjs`).

## Pengujian

```bash
cd app
npm run dev                                   # terminal 1
BASE_URL=http://localhost:5173 npm run test:privacy   # terminal 2
```

Uji ini membuka tiap tool di Chrome atau Edge yang terpasang (tanpa mengunduh browser; lokasi yang dicari: Windows dan Linux umum, macOS belum, ubah daftar path di `app/e2e/no-upload.mjs`), memproses file contoh, dan gagal bila ada request keluar dari origin, request selain GET/HEAD, atau request yang membawa body. `BASE_URL` bisa diarahkan ke situs mana pun.

## Keterbatasan (beta)

- Kompres PDF mengubah halaman menjadi gambar, jadi teksnya tidak bisa diseleksi lagi. Bila hasilnya lebih besar dari aslinya, file asli dikembalikan.
- Hapus background paling bagus untuk foto orang. Objek lain bisa kurang rapi. Unduhan pertama kira-kira 40 MB.
- OCR belum bisa membaca tulisan tangan. Unduhan pertama kira-kira 10 MB.
- Perbaiki file tidak bisa memulihkan semua PDF rusak.
- Membuka kunci PDF menyalin halaman ke dokumen baru, jadi metadata dan form interaktif tidak ikut.
- File ratusan MB bisa membuat tab kehabisan memori.

## Masukan

Pakai tombol hijau "Kasih masukan" di pojok kanan bawah situs, atau buat [issue](https://github.com/lutfiihzan/berkas-factory/issues).

## Lisensi

Belum ditentukan.
