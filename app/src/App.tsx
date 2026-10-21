import { Suspense } from 'react'
import { Link, Route, Routes, useParams } from 'react-router-dom'
import { findTool } from './registry'
import FeedbackButton from './components/FeedbackButton'
import ConsentBanner from './components/ConsentBanner'
import CommandPalette from './components/CommandPalette'
import Header from './components/shell/Header'
import Home from './pages/Home'
import OfflineBadge from './components/OfflineBadge'
import { useSeo } from './lib/seo'
import Privasi from './pages/Privasi'
import Tentang from './pages/Tentang'

function NotAvailable() {
  return (
    <main className="mx-auto flex max-w-xl justify-center px-4 py-16">
      <div className="w-full rounded-2xl bg-white p-8 text-center shadow-card">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-100 text-navy-700">
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3h8l5 5v13H6z" />
            <path d="M14 3v5h5M10 13l4 4M14 13l-4 4" />
          </svg>
        </span>
        <h1 className="mt-4 text-xl font-bold text-navy-900">Tool ini belum tersedia</h1>
        <p className="mt-2 text-sm text-navy-600">Tool yang kamu cari belum ada atau masih dalam pengerjaan.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          Kembali ke beranda
        </Link>
      </div>
    </main>
  )
}

function ToolRoute() {
  const { slug = '' } = useParams()
  const tool = findTool(slug)
  useSeo({
    title: tool ? `${tool.name} online, tanpa upload | BerkasFactory` : 'Tool tidak ditemukan | BerkasFactory',
    description: tool?.description ?? 'Tool ini belum tersedia.',
    path: `/${slug}`,
    tool: true,
    noindex: !tool || tool.status === 'coming-soon',
  })
  if (!tool?.Page) return <NotAvailable />
  const Page = tool.Page
  return (
    <Suspense fallback={<p className="p-8 text-navy-500">Memuat…</p>}>
      <Page />
    </Suspense>
  )
}

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privasi" element={<Privasi />} />
        <Route path="/tentang" element={<Tentang />} />
        <Route path="/:slug" element={<ToolRoute />} />
      </Routes>
      <FeedbackButton />
      <ConsentBanner />
      <CommandPalette />
      <OfflineBadge />
    </>
  )
}
