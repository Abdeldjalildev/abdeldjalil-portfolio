import { useEffect } from 'react'

type SeoProps = {
  title?: string
  description?: string
  path?: string
  noindex?: boolean
}

const SITE_ORIGIN = 'https://abdeldjalildev.github.io'
const DEFAULT_TITLE = 'Abdeldjalil Portfolio'
const DEFAULT_DESCRIPTION = 'Abdeldjalil Khalfa — professional frontend development portfolio and selected projects.'

function upsertMeta(attribute: 'name' | 'property', key: string, content: string): () => void {
  const selector = `meta[${attribute}="${key}"]`
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  const created = !element
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  const previous = element.getAttribute('content')
  element.setAttribute('content', content)
  return () => {
    if (!element) return
    if (created) element.remove()
    else if (previous !== null) element.setAttribute('content', previous)
  }
}

function upsertCanonical(url: string): () => void {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  const created = !element
  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.appendChild(element)
  }
  const previous = element.href
  element.href = url
  return () => {
    if (!element) return
    if (created) element.remove()
    else element.href = previous
  }
}

export default function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = window.location.pathname,
  noindex = false,
}: SeoProps) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    const cleanups = [
      upsertMeta('name', 'description', description),
      upsertMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow'),
      upsertMeta('property', 'og:title', title),
      upsertMeta('property', 'og:description', description),
      upsertMeta('property', 'og:type', 'website'),
      upsertMeta('property', 'og:url', new URL(path, SITE_ORIGIN).toString()),
      upsertMeta('name', 'twitter:card', 'summary'),
      upsertMeta('name', 'twitter:title', title),
      upsertMeta('name', 'twitter:description', description),
      upsertCanonical(new URL(path, SITE_ORIGIN).toString()),
    ]

    return () => {
      document.title = previousTitle
      cleanups.reverse().forEach(cleanup => cleanup())
    }
  }, [description, noindex, path, title])

  return null
}
