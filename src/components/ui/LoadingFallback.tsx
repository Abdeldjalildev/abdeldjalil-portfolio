import { type ReactNode } from 'react'

/**
 * Phase 03 — Loading fallback.
 *
 * Used as the fallback for React 19's <Suspense> boundaries when future routes
 * are lazy-loaded. Purely visual, no data fetching and no business logic.
 */
export default function LoadingFallback(): ReactNode {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="grid min-h-[12rem] place-items-center"
    >
      <div className="size-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  )
}

export { LoadingFallback }
