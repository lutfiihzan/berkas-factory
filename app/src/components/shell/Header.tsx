import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { tools } from '../../registry'
import ToolIcon, { categoryOfTool, groupLabel, groupOrder } from '../ToolIcon'
import { PaletteTrigger } from '../CommandPalette'

const quick = [
  { id: 'merge', label: 'Gabung' },
  { id: 'compress', label: 'Kompres' },
  { id: 'split', label: 'Pisah' },
  { id: 'protect', label: 'Kunci' },
]

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 rounded-lg text-lg font-bold tracking-tight text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400">
      <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden fill="none">
        <rect width="24" height="24" rx="7" className="fill-brand-500" />
        <path d="M7 6.500h6.500L17 10v7.500H7z" stroke="white" strokeWidth="1.700" strokeLinejoin="round" />
        <path d="M13.500 6.500V10H17" stroke="white" strokeWidth="1.700" strokeLinejoin="round" />
        <circle cx="17.500" cy="6.500" r="2" className="fill-accent-400" />
      </svg>
      BerkasFactory
    </Link>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function ToolLinks({ onNavigate, columns }: { onNavigate: () => void; columns: string }) {
  const groups = useMemo(
    () =>
      groupOrder
        .map((g) => ({ g, items: tools.filter((t) => categoryOfTool(t.id) === g) }))
        .filter((x) => x.items.length),
    [],
  )
  return (
    <div className={`grid gap-x-8 gap-y-6 ${columns}`}>
      {groups.map(({ g, items }) => (
        <div key={g}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-500">{groupLabel[g]}</h3>
          <ul className="space-y-0.5">
            {items.map((t) => {
              const soon = t.status === 'coming-soon'
              const inner = (
                <>
                  <ToolIcon id={t.id} size={32} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{t.name}</span>
                  {soon && <span className="shrink-0 rounded-full bg-navy-100 px-2 py-0.5 text-[11px] font-medium text-navy-600">Segera</span>}
                  {t.status === 'lab' && <span className="shrink-0 rounded-full bg-accent-400/25 px-2 py-0.5 text-[11px] font-medium text-navy-800">Lab</span>}
                </>
              )
              return (
                <li key={t.id}>
                  {soon ? (
                    <span aria-disabled className="flex cursor-not-allowed items-center gap-3 rounded-xl px-2 py-1.5 text-navy-400 opacity-70">
                      {inner}
                    </span>
                  ) : (
                    <Link to={`/${t.slug}`} onClick={onNavigate} className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-navy-900 transition-colors hover:bg-navy-50 focus-visible:bg-navy-50 focus-visible:outline-2 focus-visible:outline-brand-500">
                      {inner}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default function Header() {
  const [mega, setMega] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const megaBtn = useRef<HTMLButtonElement>(null)
  const drawerBtn = useRef<HTMLButtonElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const loc = useLocation()

  useEffect(() => {
    setMega(false)
    setDrawer(false)
  }, [loc.pathname])

  useEffect(() => {
    if (!mega && !drawer) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (mega) {
        setMega(false)
        megaBtn.current?.focus()
      } else {
        setDrawer(false)
        drawerBtn.current?.focus()
      }
    }
    const onDown = (e: MouseEvent) => {
      if (mega && wrap.current && !wrap.current.contains(e.target as Node)) setMega(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onDown)
    }
  }, [mega, drawer])

  useEffect(() => {
    if (!drawer) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [drawer])

  const quickTools = quick.map((q) => ({ ...q, tool: tools.find((t) => t.id === q.id) })).filter((q) => q.tool)
  const navCls = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white ${isActive ? 'bg-white/10 text-white' : 'text-navy-200'}`

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-navy-900 text-white shadow-card">
      <div ref={wrap} className="relative mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
        <Logo />
        <nav aria-label="Menu utama" className="ml-6 hidden items-center gap-1 lg:flex">
          {quickTools.map((q) => (
            <NavLink key={q.id} to={`/${q.tool!.slug}`} className={navCls}>
              {q.label}
            </NavLink>
          ))}
          <button
            ref={megaBtn}
            type="button"
            aria-expanded={mega}
            aria-controls="mega-menu"
            onClick={() => setMega((v) => !v)}
            className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white ${mega ? 'bg-white/10 text-white' : 'text-navy-200'}`}
          >
            Semua tool <Chevron open={mega} />
          </button>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <PaletteTrigger />
          </div>
          <button
            ref={drawerBtn}
            type="button"
            aria-label="Buka menu"
            aria-expanded={drawer}
            aria-controls="drawer-menu"
            onClick={() => setDrawer(true)}
            className="rounded-lg p-2 text-white hover:bg-white/10 lg:hidden"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>

        {mega && (
          <div
            id="mega-menu"
            className="absolute left-4 right-4 top-full mt-2 hidden rounded-2xl border border-navy-100 bg-white p-6 text-navy-900 shadow-card-hover lg:block"
          >
            <ToolLinks onNavigate={() => setMega(false)} columns="grid-cols-4" />
          </div>
        )}
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setDrawer(false)} />
          <div
            id="drawer-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 right-0 flex w-[min(22rem,90vw)] flex-col bg-white text-navy-900 shadow-card-hover"
          >
            <div className="flex items-center justify-between bg-navy-900 px-4 py-3 text-white">
              <span className="font-semibold">Semua tool</span>
              <button
                type="button"
                autoFocus
                aria-label="Tutup menu"
                onClick={() => {
                  setDrawer(false)
                  drawerBtn.current?.focus()
                }}
                className="rounded-lg p-2 hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-5 sm:hidden">
                <PaletteTrigger light />
              </div>
              <ToolLinks onNavigate={() => setDrawer(false)} columns="grid-cols-1" />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
