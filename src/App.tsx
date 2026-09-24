import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { I18nProvider } from './i18n/I18nProvider.tsx'
import PublicLayout from './routes/PublicLayout.tsx'
import AdminLayout from './routes/AdminLayout.tsx'
import NotFound from './routes/NotFound.tsx'
import ErrorFallback from './routes/ErrorFallback.tsx'
import SignIn from './routes/SignIn.tsx'
import LoadingFallback from './components/ui/LoadingFallback.tsx'
import { AdminAccessBoundary } from './routes/AdminAccessBoundary.tsx'
import { AuthProvider } from './auth/AuthProvider.tsx'
import { useI18n } from './i18n/context.ts'
import type { RootHandle } from './routes/Root.tsx'
import type { TranslationKey } from './i18n/types.ts'

const Home = lazy(() => import('./features/public/Home.tsx'))
const About = lazy(() => import('./features/public/About.tsx'))
const Services = lazy(() => import('./features/public/Services.tsx'))
const Projects = lazy(() => import('./features/public/Projects.tsx'))
const ProjectDetail = lazy(() => import('./features/public/ProjectDetail.tsx'))
const Reviews = lazy(() => import('./features/public/Reviews.tsx'))
const Contact = lazy(() => import('./features/public/Contact.tsx'))
const ReviewsAdmin = lazy(() => import('./features/cms/ReviewsAdmin.tsx'))
const ContactLinksAdmin = lazy(() => import('./features/cms/ContactLinksAdmin.tsx'))
const ProfileAdmin = lazy(() => import('./features/cms/ProfileAdmin.tsx'))
const ServicesAdmin = lazy(() => import('./features/cms/ServicesAdmin.tsx'))
const SkillsAdmin = lazy(() => import('./features/cms/SkillsAdmin.tsx'))
const ProjectsAdmin = lazy(() => import('./features/cms/ProjectsAdmin.tsx'))
const Dashboard = lazy(() => import('./features/cms/Dashboard.tsx'))
const SettingsAdmin = lazy(() => import('./features/cms/SettingsAdmin.tsx'))
const AnalyticsAdmin = lazy(() => import('./features/cms/AnalyticsAdmin.tsx'))
const DesignSystemPreview = lazy(() => import('./design-system/DesignSystemPreview.tsx'))

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
      { index: true, element: <Home /> },
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
          { index: true, handle: { title: 'Dashboard' } as RootHandle, element: <Dashboard /> },
          { path: 'projects', handle: { title: 'Projects' } as RootHandle, element: <ProjectsAdmin /> },
          { path: 'services', handle: { title: 'Services' } as RootHandle, element: <ServicesAdmin /> },
          { path: 'skills', handle: { title: 'Skills' } as RootHandle, element: <SkillsAdmin /> },
          { path: 'reviews', handle: { title: 'Reviews' } as RootHandle, element: <ReviewsAdmin /> },
          { path: 'profile', handle: { title: 'Profile' } as RootHandle, element: <ProfileAdmin /> },
          { path: 'contact', handle: { title: 'Contact & Social' } as RootHandle, element: <ContactLinksAdmin /> },
          { path: 'analytics', handle: { title: 'Analytics' } as RootHandle, element: <AnalyticsAdmin /> },
          { path: 'settings', handle: { title: 'Settings' } as RootHandle, element: <SettingsAdmin /> },
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
