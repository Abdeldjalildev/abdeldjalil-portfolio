import type { ReactElement } from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/context.ts'
import { Button } from '../components/ui/Button.tsx'
import { Surface } from '../components/ui/Surface.tsx'
import LoadingFallback from '../components/ui/LoadingFallback.tsx'
import { useI18n } from '../i18n/context.ts'

export function AdminAccessBoundary(): ReactElement {
  const { state, refetch } = useAuth()
  const location = useLocation()
  const { t } = useI18n()

  switch (state.status) {
    case 'loading':
      return <LoadingFallback />

    case 'unauthenticated':
      return (
        <Navigate
          to="/sign-in"
          state={{ from: location.pathname, intended: true }}
          replace
        />
      )

    case 'authenticated':
      if (!state.claims.admin) {
        return (
          <div className="grid min-h-[60dvh] place-items-center">
            <Surface
              variant="elevated"
              padding="lg"
              className="w-full max-w-sm text-center"
            >
              <h1 className="text-h3 font-semibold text-foreground">
                {t('admin_access_denied_title')}
              </h1>
              <p className="mt-2 text-sm text-foreground-muted">
                {t('admin_access_denied_message')}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={() => {
                  void refetch()
                }}
              >
                {t('admin_refresh_access')}
              </Button>
            </Surface>
          </div>
        )
      }

      return <Outlet />
  }
}
