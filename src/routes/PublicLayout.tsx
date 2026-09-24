import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { trackEvent } from '../data/analytics.ts'
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
  useEffect(() => {
    trackEvent('page_view', { path: location.pathname })
  }, [location.pathname])

  return (
    <>
      <PublicHeader />
      <Container as="main" width="content" className="min-h-[calc(100dvh-4rem)] py-8">
        <Outlet />
      </Container>
      <PublicFooter />
    </>
  )
}
