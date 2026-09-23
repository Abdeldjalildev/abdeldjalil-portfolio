import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Suspense } from 'react'
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
import About from './features/public/About.tsx'
import Services from './features/public/Services.tsx'
import Projects from './features/public/Projects.tsx'
import ProjectDetail from './features/public/ProjectDetail.tsx'
import Reviews from './features/public/Reviews.tsx'
import Contact from './features/public/Contact.tsx'
import ReviewsAdmin from './features/cms/ReviewsAdmin.tsx'
import ContactLinksAdmin from './features/cms/ContactLinksAdmin.tsx'
import ProfileAdmin from './features/cms/ProfileAdmin.tsx'
import ServicesAdmin from './features/cms/ServicesAdmin.tsx'
import SkillsAdmin from './features/cms/SkillsAdmin.tsx'
import ProjectsAdmin from './features/cms/ProjectsAdmin.tsx'
import type { TranslationKey } from './i18n/types.ts'

const placeholder = (key: TranslationKey) => {
  function Placeholder() {
    const { t } = useI18n()
    return (
      <div className="p-6">
        <h2 className="text-h3 font-semibold text-foreground">{t(key)}</h2>
      </div>
    )
  }

  return <Placeholder />
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
        element: <About />,
      },
      {
        path: 'services',
        handle: { title: 'Services' } as RootHandle,
        element: <Services />,
      },
      {
        path: 'reviews',
        handle: { title: 'Reviews' } as RootHandle,
        element: <Reviews />,
      },
      {
        path: 'contact',
        handle: { title: 'Contact' } as RootHandle,
        element: <Contact />,
      },
      {
        path: 'projects',
        handle: { title: 'Projects' } as RootHandle,
        element: <Projects />,
      },
      {
        path: 'projects/:slug',
        handle: { title: 'Project detail', hideInNavigation: true } as RootHandle,
        element: <ProjectDetail />,
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
          { index: true, handle: { title: 'Dashboard' } as RootHandle, element: placeholder('route_dashboard') },
          { path: 'projects', handle: { title: 'Projects' } as RootHandle, element: <ProjectsAdmin /> },
          { path: 'services', handle: { title: 'Services' } as RootHandle, element: <ServicesAdmin /> },
          { path: 'skills', handle: { title: 'Skills' } as RootHandle, element: <SkillsAdmin /> },
          { path: 'reviews', handle: { title: 'Reviews' } as RootHandle, element: <ReviewsAdmin /> },
          { path: 'profile', handle: { title: 'Profile' } as RootHandle, element: <ProfileAdmin /> },
          { path: 'contact', handle: { title: 'Contact & Social' } as RootHandle, element: <ContactLinksAdmin /> },
          { path: 'analytics', handle: { title: 'Analytics' } as RootHandle, element: placeholder('route_analytics') },
          { path: 'settings', handle: { title: 'Settings' } as RootHandle, element: placeholder('route_settings') },
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
