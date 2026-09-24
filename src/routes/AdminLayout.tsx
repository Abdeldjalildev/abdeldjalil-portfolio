import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { getAuth, signOut } from 'firebase/auth'
import { getFirebaseApp } from '../firebase/app.ts'
import { Button } from '../components/ui/Button.tsx'
import { Container } from '../components/ui/Container.tsx'
import { Surface } from '../components/ui/Surface.tsx'
import { useAuth } from '../auth/context.ts'
import { useI18n } from '../i18n/context.ts'
import type { TranslationKey } from '../i18n/types.ts'

const ADMIN_NAVIGATION: Array<{ to: string; key: TranslationKey; end?: boolean }> = [
  { to: '/admin', key: 'route_dashboard', end: true },
  { to: '/admin/projects', key: 'route_projects' },
  { to: '/admin/services', key: 'route_services' },
  { to: '/admin/skills', key: 'route_skills' },
  { to: '/admin/reviews', key: 'route_reviews' },
  { to: '/admin/profile', key: 'route_profile' },
  { to: '/admin/contact', key: 'route_contact' },
  { to: '/admin/analytics', key: 'route_analytics' },
  { to: '/admin/settings', key: 'route_settings' },
]

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n()
  return (
    <nav aria-label={t('admin_navigation')} className="grid gap-1">
      {ADMIN_NAVIGATION.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              'rounded-md px-3 py-2 text-sm font-medium transition-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
              isActive
                ? 'bg-surface-elevated text-foreground'
                : 'text-foreground-muted hover:bg-surface hover:text-foreground',
            ].join(' ')
          }
        >
          {t(item.key)}
        </NavLink>
      ))}
    </nav>
  )
}

export default function AdminLayout() {
  const { state } = useAuth()
  const { t } = useI18n()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut(getAuth(getFirebaseApp()))
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-30 border-b border-border-strong bg-surface-elevated/95 backdrop-blur-xs">
        <Container width="content" className="py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-foreground">{t('route_dashboard')}</span>
              <span className="hidden text-sm text-foreground-subtle sm:inline">/ {t(ADMIN_NAVIGATION.find(item => item.to === location.pathname)?.key ?? 'route_dashboard')}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                aria-expanded={mobileOpen}
                aria-controls="admin-mobile-navigation"
                onClick={() => setMobileOpen(value => !value)}
              >
                {mobileOpen ? t('menu_close') : t('admin_menu')}
              </button>
              {state.status === 'authenticated' && (
                <Button variant="ghost" size="sm" onClick={() => void handleSignOut()} disabled={signingOut}>
                  {signingOut ? t('sign_in_loading') : t('sign_out')}
                </Button>
              )}
            </div>
          </div>
        </Container>
      </header>

      {mobileOpen && (
        <div id="admin-mobile-navigation" className="border-b border-border bg-surface p-4 md:hidden">
          <Navigation onNavigate={() => setMobileOpen(false)} />
        </div>
      )}

      <Container width="content" className="grid gap-6 py-6 md:grid-cols-[13rem_minmax(0,1fr)] md:py-8">
        <aside className="hidden md:block">
          <Surface as="nav" padding="sm" aria-label={t('admin_navigation')} className="sticky top-24">
            <Navigation />
          </Surface>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </Container>
    </div>
  )
}
