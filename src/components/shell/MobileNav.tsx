/**
 * Phase 06 — Mobile navigation drawer.
 *
 * The drawer is modal while open: focus is moved inside, Tab/Shift+Tab cycle
 * within the panel, Escape closes it, background scrolling is locked, and focus
 * returns to the previously focused trigger when the drawer closes.
 */
import type { ReactNode } from 'react'
import { Fragment, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useI18n } from '../../i18n/context.ts'
import { LocaleSwitcher } from './LocaleSwitcher.tsx'
import { PUBLIC_NAVIGATION } from './navigation.ts'

export type MobileNavProps = {
  open: boolean
  onClose: () => void
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function MobileNav({ open, onClose }: MobileNavProps): ReactNode {
  const { t } = useI18n()
  const panelRef = useRef<HTMLElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const focusFirst = () => {
      closeButtonRef.current?.focus()
    }
    focusFirst()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.getClientRects().length > 0)

      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      previousFocusRef.current?.focus()
      previousFocusRef.current = null
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) return null

  return (
    <Fragment>
      <div
        className="fixed inset-0 bg-background/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        ref={panelRef}
        id="mobile-menu-panel"
        className="fixed top-0 end-0 bottom-0 w-72 max-w-[80vw] border-s border-border bg-surface-elevated shadow-elevated animate-fade"
        aria-label={t('nav_mobile')}
        aria-modal="true"
        role="dialog"
      >
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <span className="font-semibold text-foreground">{t('header_brand')}</span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-2 py-1 text-foreground-muted transition-standard hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              aria-label={t('menu_close')}
            >
              ✕
            </button>
          </div>

          <nav className="flex flex-col gap-1 py-4" aria-label={t('nav_mobile')}>
            {PUBLIC_NAVIGATION.map(({ key, to, end }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    'rounded-md px-3 py-2 text-sm font-medium transition-standard',
                    'text-foreground-muted hover:text-foreground hover:bg-surface',
                    isActive ? 'text-foreground bg-surface-elevated' : '',
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
