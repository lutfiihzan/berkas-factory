import type { ReactNode } from 'react'

/** Kelas bersama untuk kontrol formulir di kartu "Opsi". */
export const inputCls =
  'mt-1.5 w-full rounded-xl border border-navy-200 bg-white px-3 py-2.5 text-sm text-navy-900 shadow-sm outline-none transition placeholder:text-navy-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 disabled:bg-navy-50 disabled:text-navy-300'
export const selectCls = inputCls

/** Label + kontrol. `label` tampil di atas kontrol. */
export function Field({ label, hint, className = '', children }: { label: ReactNode; hint?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="font-medium text-navy-800">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-navy-500">{hint}</span>}
    </label>
  )
}

export interface ChoiceOption<T extends string | number> {
  id: T
  label: ReactNode
  hint?: ReactNode
}

/** Pilihan radio berbentuk kartu. */
export function RadioCards<T extends string | number>({
  options,
  value,
  onChange,
  name,
  cols = 3,
}: {
  options: ChoiceOption<T>[]
  value: T
  onChange: (v: T) => void
  name?: string
  cols?: 2 | 3
}) {
  return (
    <div className={`grid gap-3 ${cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
      {options.map((o) => {
        const on = value === o.id
        return (
          <label
            key={String(o.id)}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3.5 text-sm transition focus-within:ring-4 focus-within:ring-brand-500/20 ${on ? 'border-brand-500 bg-brand-500/5 shadow-sm' : 'border-navy-100 bg-white hover:border-navy-300'}`}
          >
            <input
              type="radio"
              name={name}
              className="mt-0.5 size-4 shrink-0 accent-brand-500"
              checked={on}
              onChange={() => onChange(o.id)}
            />
            <span className="min-w-0">
              <span className="block font-semibold text-navy-900">{o.label}</span>
              {o.hint && <span className="mt-0.5 block text-navy-500">{o.hint}</span>}
            </span>
          </label>
        )
      })}
    </div>
  )
}

/** Satu radio berbentuk kartu ringkas (untuk daftar opsi dengan kontrol tambahan di dalamnya). */
export function RadioRow({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label
      className={`flex cursor-pointer flex-wrap items-center gap-3 rounded-xl border-2 px-3.5 py-3 text-sm transition focus-within:ring-4 focus-within:ring-brand-500/20 ${checked ? 'border-brand-500 bg-brand-500/5' : 'border-navy-100 bg-white hover:border-navy-300'}`}
    >
      <input type="radio" className="size-4 shrink-0 accent-brand-500" checked={checked} onChange={onChange} />
      {children}
    </label>
  )
}

export function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-navy-800">
      <input type="checkbox" className="size-4 shrink-0 rounded accent-brand-500" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {children}
    </label>
  )
}

export const sliderCls = 'mt-3 h-2 w-full cursor-pointer accent-brand-500'

export function Note({ tone = 'info', children, className = '' }: { tone?: 'info' | 'warn'; children: ReactNode; className?: string }) {
  const cls =
    tone === 'warn'
      ? 'border-accent-400/60 bg-accent-400/10 text-navy-900'
      : 'border-navy-100 bg-navy-50 text-navy-600'
  return (
    <p className={`flex gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-relaxed ${cls} ${className}`}>
      <svg viewBox="0 0 20 20" className="mt-0.5 size-4 shrink-0" fill="currentColor" aria-hidden>
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.5a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0ZM9 9h1.25v4.5H9V9Z" clipRule="evenodd" />
      </svg>
      <span>{children}</span>
    </p>
  )
}
