import type { ReactElement } from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/context.ts'
import { Button } from '../components/ui/Button.tsx'
import { Surface } from '../components/ui/Surface.tsx'
import LoadingFallback from '../components/ui/LoadingFallback.tsx'

/**
 * Phase 04 — Admin authentication & authorization boundary.
 *
 * This is the real auth guard that Phase 03 left as a structural pass-through.
 * It enforces the admin authorization contract for every /admin/* route.
 *
 * Security model:
 *  1. Unauthenticated  → redirect to /sign-in (preserve destination in state)
 *  2. Authenticated non-admin → render Nothing (403-equivalent)
 *  3. Authenticated admin → render AdminLayout child routes
 *
 * The admin claim (`admin: true`) comes from a Firebase ID token custom claim
 * set server-side via the Admin SDK. It is NEVER assigned client-side.
 * The frontend check here is UX only — real authorization is enforced by
 * Firestore rules / server-side validation in later phases (per AGENTS.md §4).
 */
export function AdminAccessBoundary(): ReactElement {
  const { state, refetch } = useAuth()
  const location = useLocation()

  switch (state.status) {
    case 'loading':
      return <LoadingFallback />

    case 'unauthenticated':
      // Preserve the intended admin destination so /sign-in can redirect back.
      return (
        <Navigate
          to="/sign-in"
          state={{
            from: location.pathname,
            intended: true,
          }}
          replace
        />
      )

    case 'authenticated':
      // Deny-by-default: only users with the server-set `admin` claim proceed.
      // No client-side role logic — the claim originates from the Admin SDK.
      if (!state.claims.admin) {
        return (
          <div className="grid min-h-[60dvh] place-items-center">
            <Surface
              variant="elevated"
              padding="lg"
              className="w-full max-w-sm text-center"
            >
              <h1 className="text-h3 font-semibold text-foreground">
                Access denied
              </h1>
              <p className="mt-2 text-sm text-foreground-muted">
                You are signed in but do not have admin access.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={() => {
                  void refetch()
                }}
              >
                Refresh access
              </Button>
            </Surface>
          </div>
        )
      }

      // Authorized admin — render the admin shell. Claim freshness after a
      // role change is handled by the explicit refetch() exposed by useAuth
      // (never called during render, which would loop).
      return <Outlet />
  }
}

