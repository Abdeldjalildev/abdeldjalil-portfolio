/**
 * Phase 03 — Route handle type.
 *
 * A minimal, self-contained route-handle interface. We do not depend on the
 * react-router `RouteHandle` export (it was removed in v7), so the type is
 * defined locally to avoid coupling to an unstable API surface. It carries
 * only lightweight navigational metadata for later header/footer phases —
 * never feature data.
 */
export type RootHandle = {
  title: string
  hideInNavigation?: boolean
  devOnly?: boolean
}

/**
 * Phase 03 — Public home route (index).
 *
 * Minimal structural shell only. Real homepage content (hero, about preview,
 * featured project, etc.) belongs to Phase 11 and must not be invented here.
 */
export default function Root() {
  return (
    <div className="flex flex-col items-center gap-8 py-16 text-center">
      <h1 className="text-display font-semibold text-foreground">
        Abdeldjalil Portfolio
      </h1>
      <p className="max-w-prose text-lead text-foreground-muted">
        Frontend engineering portfolio. The public site and admin CMS are
        implemented in later phases.
      </p>
    </div>
  )
}


