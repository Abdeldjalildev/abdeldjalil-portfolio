import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Suspense, type ReactNode } from 'react'
import { DesignSystemPreview } from './design-system/DesignSystemPreview.tsx'
import { I18nProvider } from './i18n/I18nProvider.tsx'
import PublicLayout from './routes/PublicLayout.tsx'
import AdminLayout from './routes/AdminLayout.tsx'
import Root from './routes/Root.tsx'
import type { RootHandle } from './routes/Root.tsx'
import NotFound from './routes/NotFound.tsx'
import ErrorFallback from './routes/ErrorFallback.tsx'
import SignIn from './routes/SignIn.tsx'
import LoadingFallback from './components/ui/LoadingFallback.tsx'
import { AdminAccessBoundary } from './routes/AdminAccessBoundary.tsx'
import { AuthProvider } from './auth/AuthProvider.tsx'

/**
 * Phase 03 — Application route architecture.
 *
 * The route tree separates the public shell (PublicLayout) from the admin
 * shell (AdminLayout). The admin side is wrapped in AdminAccessBoundary, the
 * real authentication + authorization guard (Phase 04).
 *
 * Public routes:   /                       -> home
 *                  /about | /services | /projects | /reviews | /contact
 *                  /projects/:slug         -> project detail
 *                  /sign-in                -> authentication entry point
 *
 * Admin routes:    /admin                  -> admin index/dashboard
 *                  /admin/*                -> future admin sections
 *
 * No real content pages exist yet — every non-root branch renders a minimal
 * architectural placeholder so the routing contract is exercised without
 * inventing portfolio content.
 *
 * The Phase 02 design-system verification surface is exposed only under
 * /.well-known/design-system during development, never in production routing
 * and never in public navigation.
 *
 * AuthProvider wraps the entire application so auth state is available to
 * all routes and the admin auth boundary.
 */

// Lightweight structural placeholders for future feature routes.
// These return minimal, non-content markup so the route hierarchy is
// valid and navigable without producing fake portfolio content.
const placeholder = (label: string): (() => ReactNode) => () => (
  <div className="p-6">
    <h2 className="text-h3 font-semibold text-foreground">{label}</h2>
    <p className="mt-2 text-foreground-muted">Phase 03 placeholder — not yet implemented.</p>
  </div>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <ErrorFallback />,
    children: [
      { index: true, element: <Root /> },
      {
        path: 'about',
        handle: { title: 'About' } as RootHandle,
        element: placeholder('About')(),
      },
      {
        path: 'services',
        handle: { title: 'Services' } as RootHandle,
        element: placeholder('Services')(),
      },
      {
        path: 'reviews',
        handle: { title: 'Reviews' } as RootHandle,
        element: placeholder('Reviews')(),
      },
      {
        path: 'contact',
        handle: { title: 'Contact' } as RootHandle,
        element: placeholder('Contact')(),
      },
      {
        path: 'projects',
        handle: { title: 'Projects' } as RootHandle,
        element: placeholder('Projects')(),
      },
      {
        path: 'projects/:slug',
        handle: { title: 'Project detail', hideInNavigation: true } as RootHandle,
        element: placeholder('Project')(),
      },
      {
        // Development-only design-system verification entry.
        // Never rendered in production; never linked from public navigation.
        path: '.well-known/design-system',
        handle: { title: 'Design System', devOnly: true, hideInNavigation: true } as RootHandle,
        element: <DesignSystemPreview />,
      },
      {
        path: 'sign-in',
        handle: { title: 'Sign in', hideInNavigation: true, devOnly: false } as RootHandle,
        element: <SignIn />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminAccessBoundary />,
    errorElement: <ErrorFallback />,
    children: [
      {
        element: <AdminLayout />,
        errorElement: <ErrorFallback />,
        children: [
          {
            index: true,
            handle: { title: 'Dashboard' } as RootHandle,
            element: placeholder('Dashboard')(),
          },
          {
            path: 'projects',
            handle: { title: 'Projects' } as RootHandle,
            element: placeholder('Projects')(),
          },
          {
            path: 'services',
            handle: { title: 'Services' } as RootHandle,
            element: placeholder('Services')(),
          },
          {
            path: 'skills',
            handle: { title: 'Skills' } as RootHandle,
            element: placeholder('Skills')(),
          },
          {
            path: 'reviews',
            handle: { title: 'Reviews' } as RootHandle,
            element: placeholder('Reviews')(),
          },
          {
            path: 'profile',
            handle: { title: 'Profile' } as RootHandle,
            element: placeholder('Profile')(),
          },
          {
            path: 'contact',
            handle: { title: 'Contact & Social' } as RootHandle,
            element: placeholder('Contact')(),
          },
          {
            path: 'analytics',
            handle: { title: 'Analytics' } as RootHandle,
            element: placeholder('Analytics')(),
          },
          {
            path: 'settings',
            handle: { title: 'Settings' } as RootHandle,
            element: placeholder('Settings')(),
          },
        ],
      },
    ],
  },
  {
    // Catch-all: anything not matched above.
    path: '*',
    element: <NotFound />,
  },
])

function App() {
  // I18nProvider wraps AuthProvider so locale state is available to EVERY
  // route, including /sign-in (an auth-boundary sibling, not a child of
  // AuthProvider). The doc-level lang/dir attributes are set inside
  // I18nProvider's effect.
  return (
    <I18nProvider>
      <AuthProvider>
        {/* React 19 <Suspense> provides the loading fallback for any future
            lazy-loaded routes. */}
        <Suspense fallback={<LoadingFallback />}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </I18nProvider>
  )
}

export default App