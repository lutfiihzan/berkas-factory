import { useEffect } from 'react'

// Domain produksi. Samakan dengan SITE di scripts/gen-sitemap.mjs.
export const SITE_URL = 'https://tools.senikode.com'

interface SeoInput {
  title: string
  description: string
  path: string
  /** true untuk tool coming-soon */
  noindex?: boolean
  /** true untuk halaman tool (JSON-LD SoftwareApplication) */
  tool?: boolean
  faq?: [string, string][]
}

function setMeta(attr: 'name' | 'property', key: string, content: string | null) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (content === null) return el?.remove()
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

export function useSeo({ title, description, path, noindex, tool, faq }: SeoInput) {
  const faqKey = faq ? JSON.stringify(faq) : ''
  useEffect(() => {
    const url = SITE_URL + path
    document.title = title
    setMeta('name', 'description', description)
    setMeta('name', 'robots', noindex ? 'noindex' : null)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:type', 'website')
    setCanonical(url)

    const graph: object[] = []
    if (tool && !noindex) {
      graph.push({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: title.split(' | ')[0],
        description,
        url,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
      })
    }
    if (faqKey) {
      graph.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: (JSON.parse(faqKey) as [string, string][]).map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      })
    }
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(graph.length === 1 ? graph[0] : graph)
    if (graph.length) document.head.appendChild(script)
    return () => {
      script.remove()
      setMeta('name', 'robots', null)
    }
  }, [title, description, path, noindex, tool, faqKey])
}
