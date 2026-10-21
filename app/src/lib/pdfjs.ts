import * as pdfjs from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// Dipakai dari main thread maupun Web Worker. Mengembalikan modul pdfjs yang sudah dikonfigurasi.
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc
export { pdfjs }
