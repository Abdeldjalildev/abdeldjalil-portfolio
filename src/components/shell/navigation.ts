/**
 * Phase 06 — canonical public navigation contract.
 *
 * Single source of truth for public navigation entries. Keys are i18n
 * dictionary keys (translated per locale); paths are canonical public routes.
 * Header, mobile drawer and footer all consume this — never duplicate it.
 */
export const PUBLIC_NAVIGATION: ReadonlyArray<{ key: string; to: string }> = [
  { key: 'nav_home', to: '/' },
  { key: 'nav_about', to: '/about' },
  { key: 'nav_services', to: '/services' },
  { key: 'nav_projects', to: '/projects' },
  { key: 'nav_reviews', to: '/reviews' },
  { key: 'nav_contact', to: '/contact' },
]
