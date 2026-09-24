/**
 * Phase 06 — Public footer.
 *
 * Renders only published public social/contact links. Firestore documents cross
 * the Phase 05 runtime schema boundary before entering the UI.
 */
import { type JSX, type ReactNode, useEffect, useState } from 'react'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import { getFirebaseApp } from '../../firebase/app.ts'
import type { ContactLink } from '../../data/types.ts'
import { contactLinkSchema, validate } from '../../data/schema/index.ts'
import type { Locale } from '../../data/enums.ts'
import { contactLinksPath } from '../../data/paths.ts'
import { useI18n } from '../../i18n/context.ts'
import { Container } from '../ui/Container.tsx'

type FooterState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; links: ContactLink[] }

export function PublicFooter(): ReactNode {
  const { t, locale } = useI18n()
  const [state, setState] = useState<FooterState>({ status: 'loading' })

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const db = getFirestore(getFirebaseApp())
        const q = query(collection(db, contactLinksPath()), where('published', '==', true))
        const snapshot = await getDocs(q)
        const links = snapshot.docs
          .map((doc) => validate(contactLinkSchema, doc.data(), doc.ref.path))
          .filter((result): result is { ok: true; value: ContactLink } => result.ok)
          .map((result) => result.value)
          .filter((link) => link.published)
          .sort((a, b) => a.order - b.order)
        setState({ status: 'ready', links })
      } catch (error) {
        console.warn('Public footer links failed to load.', error)
        setState({ status: 'error' })
      }
    }

    void fetchLinks()
  }, [])

  return (
    <footer className="border-t border-border bg-surface-elevated/80 py-8">
      <Container width="content">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-1 md:items-start">
            <span className="font-semibold text-foreground">{t('header_brand')}</span>
            <span className="text-sm text-foreground-muted">{t('footer_copyright')}</span>
          </div>

          {state.status === 'loading' && (
            <span className="text-sm text-foreground-muted" role="status">
              {t('loading_label')}
            </span>
          )}

          {state.status === 'ready' && state.links.length > 0 && (
            <nav aria-label={t('footer_social')} className="flex items-center gap-4">
              {state.links.map((link) => (
                <SocialLink key={link.value} link={link} locale={locale} />
              ))}
            </nav>
          )}
        </div>
      </Container>
    </footer>
  )
}

function linkLabel(link: ContactLink, locale: Locale): string {
  const localized = link.label[locale]
  return localized || link.label.en
}

function linkHref(link: ContactLink): string {
  const value = link.value.trim()
  switch (link.type) {
    case 'email':
      return value.startsWith('mailto:') ? value : `mailto:${value}`
    case 'phone':
      return value.startsWith('tel:') ? value : `tel:${value.replaceAll(' ', '')}`
    case 'whatsapp': {
      const digits = value.replace(/[^0-9]/g, '')
      return value.startsWith('http') ? value : `https://wa.me/${digits}`
    }
    default:
      return value
  }
}

function SocialLink({ link, locale }: { link: ContactLink; locale: Locale }): JSX.Element {
  const href = linkHref(link)
  const isExternal = href.startsWith('http')
  const icon = getIconForType(link.type)

  return (
    <a
      href={href}
      aria-label={linkLabel(link, locale)}
      className="flex size-11 items-center justify-center rounded-md border border-border text-foreground-muted transition-standard hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
    >
      {icon}
    </a>
  )
}

function getIconForType(type: string): JSX.Element {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  const pathByType: Record<string, string> = {
    github: 'M9 19c-5 1.5-5-2.1-5-2.1C2.5 15 2 14 2 12c-1.5-.7-1.5-.7-1.5-1.5 0-.5.5-1.5 1-2 .5-.7 1.5-1.5 2.5-1.3.5 0 1 .1 1.5.2 1.5-1.5 3.5-.5 4.5.5.5 0 1-.1 1.5-.2.5.5 1 1.5 1.3 2.5.5 0 1-.1 1.5-.2 0 1 0 1.5.2v2c0 .3-.2.7-.5 1-.3.3-.7.5-1 .5 0 .5-.5 1-1 1.5-.5.5-1 1-1.5 1.5v.3c0 .5.3 1 .5 1.3.5 0 1 .2 1.5.5',
    linkedin: 'M16 8a6 6 0 0 1 0 8v3h4v-3a4 4 0 0 0-.5-2 4 4 0 0 0-3.5-3.5 4 4 0 0 0-3.5 3.5v3h4v-3a2 2 0 0 1 2-2 2 0 0 1 2 2v3m-8 8H4v-13h4zm0 0h4',
    email: 'M4 4h16c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z',
  }
  const path = pathByType[type]
  return (
    <svg {...common}>
      {path ? <path d={path} /> : <circle cx="12" cy="12" r="5" />}
    </svg>
  )
}
