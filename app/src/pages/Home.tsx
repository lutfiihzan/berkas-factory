import Hero from './landing/Hero'
import Catalog from './landing/Catalog'
import Explain from './landing/Explain'
import Faq, { faq } from './landing/Faq'
import { useSeo } from '../lib/seo'
import { Bulk, Footer, Kitchen } from './landing/Extras'

export default function Home() {
  useSeo({
    title: 'BerkasFactory: alat PDF dan gambar online, tanpa upload',
    description: 'Gabung, kompres, pisah PDF dan olah gambar langsung di browsermu. Filemu nggak ke mana-mana.',
    path: '/',
    faq,
  })
  return (
    <main>
      <Hero />
      <Catalog />
      <Bulk />
      <Explain />
      <Kitchen />
      <Faq />
      <Footer />
    </main>
  )
}
