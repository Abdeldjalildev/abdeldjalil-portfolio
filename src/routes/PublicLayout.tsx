import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { trackEvent } from '../data/analytics.ts'
import { useI18n } from '../i18n/context.ts'
import Seo from '../components/seo/Seo.tsx'
import { Container } from '../components/ui/Container.tsx'
import { PublicHeader } from '../components/shell/PublicHeader.tsx'
import { PublicFooter } from '../components/shell/PublicFooter.tsx'

/**
 * Phase 03/06 — Public application shell.
 *
 * Establishes the real public shell structure:
 *  - PublicHeader: responsive navigation + locale switcher (Phase 06)
 *  - main content boundary (gutted via Container)
 *  - PublicFooter: published social links only
 *
 * Uses the Phase 02 Container primitive; no new styling invented here.
 */
export default function PublicLayout() {
  const location = useLocation()
  const { t } = useI18n()
  useEffect(() => {
    trackEvent('page_view', { path: location.pathname })
  }, [location.pathname])

  const titles: Record<string, string> = {
    '/': t('header_brand'),
    '/about': t('route_about'),
    '/services': t('route_services'),
    '/projects': t('route_projects'),
    '/reviews': t('route_reviews'),
    '/contact': t('route_contact'),
    '/sign-in': t('sign_in_title'),
  }

  return (
    <>
      <Seo title={
        location.pathname.startsWith('/projects/') ? `${t('route_projects')} · ${t('header_brand')}` : `${titles[location.pathname] ?? t('header_brand')} · ${t('header_brand')}`
      } path={location.pathname} noindex={location.pathname === '/sign-in'} />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface-elevated focus:px-4 focus:py-3 focus:text-foreground focus:shadow-elevated">{t('skip_to_content')}</a>
      <PublicHeader />
      <Container as="main" id="main-content" width="content" className="min-h-[calc(100dvh-4rem)] py-8">
        <Outlet />
      </Container>
      <PublicFooter />
    </>
  )
}
