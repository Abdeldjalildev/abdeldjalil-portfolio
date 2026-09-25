import type { TranslationKey } from '../../i18n/types.ts'

/**
 * Phase 06 — canonical public navigation contract.
 *
 * Header, mobile drawer and any future public shell consumer share this list.
 * Translation keys are compile-time checked against the canonical dictionary.
 */
export const PUBLIC_NAVIGATION: ReadonlyArray<{
  key: TranslationKey
  to: string
  end?: boolean
}> = [
  { key: 'nav_home', to: '/', end: true },
  { key: 'nav_about', to: '/about' },
  { key: 'nav_services', to: '/services' },
  { key: 'nav_projects', to: '/projects' },
  { key: 'nav_reviews', to: '/reviews' },
  { key: 'nav_contact', to: '/contact' },
]
