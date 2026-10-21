// Ikon per tool: kotak membulat berwarna kategori + glyph putih (SVG inline, 24x24, stroke 1.9).
import type { ReactNode } from 'react'

export type ToolGroup = 'organize' | 'optimize' | 'convert' | 'edit' | 'security' | 'image' | 'file'

const GROUP_OF: Record<string, ToolGroup> = {
  merge: 'organize',
  split: 'organize',
  rotate: 'organize',
  organize: 'organize',
  compress: 'optimize',
  'image-compress': 'optimize',
  'pdf-to-image': 'convert',
  'image-to-pdf': 'convert',
  watermark: 'edit',
  'page-numbers': 'edit',
  protect: 'security',
  unlock: 'security',
  'remove-bg': 'image',
  ocr: 'image',
  repair: 'file',
}

export const categoryOfTool = (id: string): ToolGroup => GROUP_OF[id] ?? 'file'

export const groupLabel: Record<ToolGroup, string> = {
  organize: 'Atur PDF',
  optimize: 'Perkecil ukuran',
  convert: 'Ubah format',
  edit: 'Edit PDF',
  security: 'Keamanan',
  image: 'Gambar',
  file: 'Perbaikan',
}

export const groupOrder: ToolGroup[] = ['organize', 'optimize', 'convert', 'edit', 'security', 'image', 'file']

/** Kelas latar per kategori (dipakai utility Tailwind bertoken). */
export const groupBg: Record<ToolGroup, string> = {
  organize: 'bg-cat-organize',
  optimize: 'bg-cat-optimize',
  convert: 'bg-cat-convert',
  edit: 'bg-cat-edit',
  security: 'bg-cat-security',
  image: 'bg-cat-image',
  file: 'bg-cat-file',
}

const glyphs: Record<string, ReactNode> = {
  merge: (
    <>
      <path d="M4 5h6v5H4zM14 5h6v5h-6z" />
      <path d="M7 10v2a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3v-2M12 15v5M9.5 17.5 12 20l2.5-2.5" />
    </>
  ),
  split: (
    <>
      <path d="M12 3v7M9.5 7.5 12 10l2.5-2.5" />
      <path d="M12 10c0 3-6 3-6 7v3M12 10c0 3 6 3 6 7v3" />
    </>
  ),
  rotate: (
    <>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 4v5h-5" />
    </>
  ),
  organize: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <path d="M13 16.5h7M16.5 13v7" />
    </>
  ),
  compress: (
    <>
      <path d="M12 3v6M9.5 6.5 12 9l2.5-2.5" />
      <path d="M12 21v-6M9.5 17.5 12 15l2.5 2.5" />
      <path d="M4 12h16" />
    </>
  ),
  'image-compress': (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m4 18 5-5 3 3 3-3 5 5" />
    </>
  ),
  'pdf-to-image': (
    <>
      <path d="M6 3h8l4 4v5" />
      <path d="M6 3v18h5" />
      <rect x="11" y="13" width="9.5" height="8" rx="1.5" />
      <path d="m11.5 20 3-3 2 2 1.5-1.5 2 2.5" />
    </>
  ),
  'image-to-pdf': (
    <>
      <rect x="3.5" y="3.5" width="9.5" height="8" rx="1.5" />
      <path d="m4 10.5 3-3 2 2 1.5-1.5 2 2.5" />
      <path d="M13 12v9h5a2 2 0 0 0 2-2v-6l-3-3h-2" />
      <path d="M16 17h2.5" />
    </>
  ),
  watermark: <path d="M12 3.5s6 6.2 6 10.5a6 6 0 0 1-12 0c0-4.300 6-10.500 6-10.500zM9.500 14.500a2.500 2.500 0 0 0 2.500 2.500" />,
  'page-numbers': (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M9.500 14.500 11 13v6M13.500 19h3" />
    </>
  ),
  protect: (
    <>
      <rect x="5" y="10.500" width="14" height="10" rx="2.500" />
      <path d="M8 10.500V8a4 4 0 0 1 8 0v2.500M12 14.500v2.500" />
    </>
  ),
  unlock: (
    <>
      <rect x="5" y="10.500" width="14" height="10" rx="2.500" />
      <path d="M8 10.500V8a4 4 0 0 1 7.500-2M12 14.500v2.500" />
    </>
  ),
  repair: <path d="M14.500 6.500a4 4 0 0 0-5 5L4 17l3 3 5.500-5.500a4 4 0 0 0 5-5l-2.500 2.500-2.500-.5-.5-2.500z" />,
  ocr: (
    <>
      <path d="M4 8V5.500A1.500 1.500 0 0 1 5.500 4H8M16 4h2.500A1.500 1.500 0 0 1 20 5.500V8M20 16v2.500a1.500 1.500 0 0 1-1.500 1.500H16M8 20H5.500A1.500 1.500 0 0 1 4 18.500V16" />
      <path d="M8.500 15.500 12 8l3.500 7.500M9.800 13h4.400" />
    </>
  ),
  'remove-bg': (
    <>
      <path d="M12 3.500 14 8l4.500 2L14 12l-2 4.500L10 12l-4.500-2L10 8z" />
      <path d="M18.500 15.500l.8 1.700 1.700.8-1.700.8-.8 1.700-.8-1.700-1.700-.8 1.700-.8z" />
    </>
  ),
}

const generic = (
  <>
    <path d="M6 3h8l5 5v13H6z" />
    <path d="M14 3v5h5M9 13h7M9 17h5" />
  </>
)

export default function ToolIcon({ id, size = 40, className = '' }: { id: string; size?: number; className?: string }) {
  const g = categoryOfTool(id)
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center text-white ${groupBg[g]} ${className}`}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.3) }}
    >
      <svg
        viewBox="0 0 24 24"
        width={Math.round(size * 0.58)}
        height={Math.round(size * 0.58)}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {glyphs[id] ?? generic}
      </svg>
    </span>
  )
}
