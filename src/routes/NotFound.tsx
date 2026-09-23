import { Link } from 'react-router-dom'

/**
 * Phase 03 — Not-found fallback.
 *
 * Rendered for any unmatched route (the `*` catch-all). Uses the Phase 02
 * design system only; no placeholder content that looks like a real page.
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 self-center py-16 text-center">
      <h1 className="text-h1 font-semibold text-foreground">404</h1>
      <p className="text-foreground-muted">The page you are looking for does not exist.</p>
      <Link
        to="/"
        className="inline-flex items-center rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-foreground shadow-soft transition-standard hover:bg-surface"
      >
        Return home
      </Link>
    </div>
  )
}
