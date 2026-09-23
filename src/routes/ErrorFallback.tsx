import { useRouteError } from 'react-router-dom'
import { Button } from '../components/ui/Button.tsx'
import { useI18n } from '../i18n/context.ts'

/**
 * Phase 03 — Application error fallback.
 *
 * Route errors are intentionally rendered through generic, localized copy.
 * Raw exception messages and route-error payloads are never exposed to visitors.
 */
export default function ErrorFallback() {
  useRouteError()
  const { t } = useI18n()

  return (
    <div
      role="alert"
      className="m-6 flex flex-col gap-3 self-start rounded-lg border border-error bg-surface-elevated p-5 text-error-foreground"
    >
      <h2 className="font-semibold">{t('error_title')}</h2>
      <p className="text-sm opacity-85">{t('error_message')}</p>
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => window.location.assign('/')}
      >
        {t('error_return_home')}
      </Button>
    </div>
  )
}
