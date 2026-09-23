/**
 * Phase 06 — Mobile navigation drawer.
 *
 * Rendered by PublicHeader. Uses a portal-free fixed panel with focus trapping
 * approximation: Escape and link clicks close it, and body scroll is locked
 * while open. No external UI library required.
 */

import type { ReactNode } from 'react'
import { Fragment, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useI18n } from '../../i18n/context.ts'
import { LocaleSwitcher } from './LocaleSwitcher.tsx'
import { PUBLIC_NAVIGATION } from './navigation.ts'

export type MobileNavProps = {
  open: boolean
  onClose: () => void
}

export function MobileNav({
  open,
  onClose,
}: MobileNavProps): ReactNode {
  const { t } = useI18n()

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
    return undefined
  }, [open])

  if (!open) return null

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        id="mobile-menu-panel"
        className="fixed top-0 end-0 bottom-0 w-72 max-w-[80vw] border-s border-border bg-surface-elevated shadow-elevated animate-fade"
        aria-label={t('nav_mobile')}
      >
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <span className="font-semibold text-foreground">
              {t('header_brand')}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-2 py-1 text-foreground-muted transition-standard hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              aria-label={t('menu_close')}
            >
              ✕
            </button>
          </div>

          <nav className="flex flex-col gap-1 py-4" aria-label={t('nav_mobile')}>
            {PUBLIC_NAVIGATION.map(({ key, to }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    'rounded-md px-3 py-2 text-sm font-medium transition-standard',
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
          </nav>

          <div className="mt-auto border-t border-border pt-4">
            <LocaleSwitcher />
          </div>
        </div>
      </aside>
    </Fragment>
  )
}
