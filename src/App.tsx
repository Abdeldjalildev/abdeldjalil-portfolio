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
import { useI18n } from './i18n/context.ts'
import type { TranslationKey } from './i18n/types.ts'

const placeholder = (key: TranslationKey): (() => ReactNode) => function Placeholder() {
  const { t } = useI18n()
  return (
    <div className="p-6">
      <h2 className="text-h3 font-semibold text-foreground">{t(key)}</h2>
    </div>
  )
}

const developmentRoutes = import.meta.env.DEV
  ? [
      {
        path: '.well-known/design-system',
        handle: {
          title: 'Design System',
          devOnly: true,
          hideInNavigation: true,
        } as RootHandle,
        element: <DesignSystemPreview />,
      },
    ]
  : []

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
        element: placeholder('route_about')(),
      },
      {
        path: 'services',
        handle: { title: 'Services' } as RootHandle,
        element: placeholder('route_services')(),
      },
      {
        path: 'reviews',
        handle: { title: 'Reviews' } as RootHandle,
        element: placeholder('route_reviews')(),
      },
      {
        path: 'contact',
        handle: { title: 'Contact' } as RootHandle,
        element: placeholder('route_contact')(),
      },
      {
        path: 'projects',
        handle: { title: 'Projects' } as RootHandle,
        element: placeholder('route_projects')(),
      },
      {
        path: 'projects/:slug',
        handle: { title: 'Project detail', hideInNavigation: true } as RootHandle,
        element: placeholder('route_project')(),
      },
      ...developmentRoutes,
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
          { index: true, handle: { title: 'Dashboard' } as RootHandle, element: placeholder('route_dashboard')() },
          { path: 'projects', handle: { title: 'Projects' } as RootHandle, element: placeholder('route_projects')() },
          { path: 'services', handle: { title: 'Services' } as RootHandle, element: placeholder('route_services')() },
          { path: 'skills', handle: { title: 'Skills' } as RootHandle, element: placeholder('route_skills')() },
          { path: 'reviews', handle: { title: 'Reviews' } as RootHandle, element: placeholder('route_reviews')() },
          { path: 'profile', handle: { title: 'Profile' } as RootHandle, element: placeholder('route_profile')() },
          { path: 'contact', handle: { title: 'Contact & Social' } as RootHandle, element: placeholder('route_contact')() },
          { path: 'analytics', handle: { title: 'Analytics' } as RootHandle, element: placeholder('route_analytics')() },
          { path: 'settings', handle: { title: 'Settings' } as RootHandle, element: placeholder('route_settings')() },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
])

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </I18nProvider>
  )
}

export default App
