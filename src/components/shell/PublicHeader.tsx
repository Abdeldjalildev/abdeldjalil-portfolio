/**
 * Phase 06 — Public header navigation.
 *
 * Responsive header: desktop nav links + locale switcher on the left, mobile
 * menu button on the right. The mobile drawer is rendered by MobileNav.
 * Navigation labels are shell-owned i18n strings; business content pages
 * belong to later phases and are not implemented here.
 */

import { type JSX } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useI18n } from '../../i18n/context.ts'
import { Container } from '../ui/Container.tsx'
import { LocaleSwitcher } from './LocaleSwitcher.tsx'
import { MobileNav } from './MobileNav.tsx'
import { PUBLIC_NAVIGATION } from './navigation.ts'

export function PublicHeader(): JSX.Element {
  const { t } = useI18n()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="border-b border-border bg-surface-elevated/80 backdrop-blur-xs">
        <Container width="content" className="py-3">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="font-semibold text-foreground">
              {t('header_brand')}
            </Link>

            {/* Desktop navigation */}
            <nav
              className="hidden items-center gap-2 md:flex"
              aria-label={t('nav_main')}
            >
              {PUBLIC_NAVIGATION.map(({ key, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    [
                      'rounded-md px-3 py-1.5 text-sm font-medium transition-standard',
                      'text-foreground-muted hover:text-foreground hover:bg-surface',
                      isActive
                        ? 'text-foreground bg-surface-elevated'
                        : '',
                    ].join(' ')
                  }
                >
                  {t(key)}
                </NavLink>
              ))}
              <LocaleSwitcher />
            </nav>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 md:hidden">
              <LocaleSwitcher />
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex items-center justify-center rounded-md border border-border px-2 py-1.5 text-foreground-muted transition-standard hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                aria-label={t('menu_open')}
                aria-controls="mobile-menu-panel"
                aria-expanded={mobileOpen}
                aria-haspopup="true"
              >
                {/* Hamburger icon (inline SVG, direction-agnostic) */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <line x1="3" y1="5" x2="17" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="3" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </Container>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
