import { useState } from 'react'
import { Link } from 'react-router-dom'
import { tools } from '../../registry'
import ToolIcon from '../../components/ToolIcon'

const GROUPS: { label: string; ids: string[] }[] = [
  { label: 'Atur halaman', ids: ['merge', 'split', 'rotate', 'organize'] },
  { label: 'Optimalkan', ids: ['compress', 'image-compress', 'repair'] },
  { label: 'Konversi', ids: ['pdf-to-image', 'image-to-pdf', 'ocr'] },
  { label: 'Edit', ids: ['watermark', 'page-numbers', 'remove-bg'] },
  { label: 'Keamanan', ids: ['protect', 'unlock'] },
]
const OTHER = 'Lainnya'
const groupOf = (id: string) => GROUPS.find((g) => g.ids.includes(id))?.label ?? OTHER

export default function Catalog() {
  const [active, setActive] = useState('Semua')
  const hasOther = tools.some((t) => groupOf(t.id) === OTHER)
  const pills = ['Semua', ...GROUPS.map((g) => g.label), ...(hasOther ? [OTHER] : [])]
  const list = tools.filter((t) => active === 'Semua' || groupOf(t.id) === active)

  return (
    <section id="tool" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12 sm:py-16">
      <h2 className="text-center text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">Yang paling sering dicari</h2>
      <div className="mt-6 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter kategori">
        {pills.map((p) => (
          <button
            key={p}
            onClick={() => setActive(p)}
            aria-pressed={active === p}
            className={
              'rounded-full px-4 py-2 text-sm font-medium transition-colors ' +
              (active === p ? 'bg-navy-900 text-white' : 'bg-white text-navy-700 shadow-card hover:bg-navy-100')
            }
          >
            {p}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((t) => {
          const soon = t.status === 'coming-soon'
          const card = (
            <div
              className={
                'relative flex h-full flex-col rounded-2xl bg-white p-5 shadow-card ' +
                (soon ? 'opacity-60' : 'transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover')
              }
            >
              {t.status !== 'stable' && (
                <span
                  className={
                    'absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs font-semibold ' +
                    (soon ? 'bg-navy-100 text-navy-600' : 'bg-accent-400 text-navy-900')
                  }
                >
                  {soon ? 'Segera hadir' : 'Lab'}
                </span>
              )}
              <ToolIcon id={t.id} size={44} />
              <h3 className="mt-4 font-bold text-navy-900">{t.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-navy-600">{t.description}</p>
            </div>
          )
          return soon ? (
            <div key={t.id} aria-disabled="true">{card}</div>
          ) : (
            <Link key={t.id} to={'/' + t.slug} className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">{card}</Link>
          )
        })}
      </div>
    </section>
  )
}
